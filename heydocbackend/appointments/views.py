from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Appointment, AppointmentStatus
from .serializers import (
    AppointmentSerializer, 
    CreateAppointmentSerializer,
    AppointmentStatusSerializer
)
from .filters import AppointmentFilter

class AppointmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AppointmentFilter

    def get_queryset(self):
        user = self.request.user
        if user.is_doctor:
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.filter(patient=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateAppointmentSerializer
        return AppointmentSerializer

class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_doctor:
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.filter(patient=user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment(request, appointment_id):
    appointment = get_object_or_404(
        Appointment, 
        id=appointment_id,
        patient=request.user
    )
    
    try:
        cancelled_status = AppointmentStatus.objects.get(name='cancelled')
        appointment.status = cancelled_status
        appointment.save()
        
        return Response({
            'message': 'Appointment cancelled successfully',
            'booking_id': appointment.booking_id
        })
    except AppointmentStatus.DoesNotExist:
        return Response(
            {'error': 'Cancel status not found'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_slots(request):
    """Get available time slots for a doctor on a specific date."""
    from datetime import datetime, time, timedelta
    from doctors.models import DoctorProfile
    
    doctor_id = request.query_params.get('doctor_id')
    date_str = request.query_params.get('date')
    
    if not doctor_id or not date_str:
        return Response(
            {'error': 'doctor_id and date parameters are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        doctor = DoctorProfile.objects.get(id=doctor_id)
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (DoctorProfile.DoesNotExist, ValueError):
        return Response(
            {'error': 'Invalid doctor_id or date format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if the date is in the past
    from django.utils import timezone
    if appointment_date < timezone.now().date():
        return Response({
            'doctor_id': doctor_id,
            'date': date_str,
            'available_slots': [],
            'message': 'Cannot book appointments for past dates'
        })
    
    # Standard working hours (can be customized per doctor)
    standard_slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30'
    ]
    
    # Get existing appointments for this doctor on this date
    booked_slots = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=appointment_date,
        status__name__in=['scheduled', 'confirmed']
    ).values_list('appointment_time', flat=True)
    
    # Convert booked times to strings for comparison
    booked_times = [time.strftime('%H:%M') for time in booked_slots]
    
    # Filter out booked slots
    available_slots = [slot for slot in standard_slots if slot not in booked_times]
    
    # If it's today, filter out past times
    if appointment_date == timezone.now().date():
        current_time = timezone.now().time()
        available_slots = [
            slot for slot in available_slots 
            if time.fromisoformat(slot + ':00') > current_time
        ]
    
    return Response({
        'doctor_id': doctor_id,
        'date': date_str,
        'available_slots': available_slots,
        'booked_slots': booked_times,
        'total_slots': len(standard_slots),
        'available_count': len(available_slots)
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_date_availability(request):
    """Check if a doctor has any available slots on a specific date."""
    from datetime import datetime
    from doctors.models import DoctorProfile
    
    doctor_id = request.query_params.get('doctor_id')
    date_str = request.query_params.get('date')
    
    if not doctor_id or not date_str:
        return Response(
            {'error': 'doctor_id and date parameters are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        doctor = DoctorProfile.objects.get(id=doctor_id)
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (DoctorProfile.DoesNotExist, ValueError):
        return Response(
            {'error': 'Invalid doctor_id or date format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if the date is in the past
    from django.utils import timezone
    if appointment_date < timezone.now().date():
        return Response({
            'available': False,
            'reason': 'Past date'
        })
    
    # Standard working hours (14 slots total)
    total_standard_slots = 14
    
    # Get booked appointments count
    booked_count = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=appointment_date,
        status__name__in=['scheduled', 'confirmed']
    ).count()
    
    available_count = total_standard_slots - booked_count
    
    return Response({
        'available': available_count > 0,
        'available_count': available_count,
        'booked_count': booked_count,
        'total_slots': total_standard_slots
    })