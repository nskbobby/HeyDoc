from rest_framework import generics, filters, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import DoctorProfile, Specialization
from .serializers import DoctorProfileSerializer, DoctorListSerializer, SpecializationSerializer
from .filters import DoctorFilter

class SpecializationListView(generics.ListAPIView):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DoctorFilter
    search_fields = ['user__first_name', 'user__last_name', 'specializations__name']
    ordering_fields = ['rating', 'consultation_fee', 'years_of_experience']
    ordering = ['-rating', '-total_reviews']
    
    def get_queryset(self):
        return DoctorProfile.objects.filter(
            is_available=True, 
            user__is_active=True
        ).select_related('user').prefetch_related('specializations', 'clinics')

class DoctorDetailView(generics.RetrieveAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
def doctor_availability(request, doctor_id):
    # This would contain logic to get available slots
    # Implementation depends on your specific requirements
    return Response({
        'doctor_id': doctor_id,
        'available_dates': [],  # Add your logic here
        'message': 'Availability endpoint - implement based on requirements'
    })