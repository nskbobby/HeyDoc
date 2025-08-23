from rest_framework import serializers
from django.db import IntegrityError
from django.db.models import Q
from .models import Appointment, AppointmentStatus, AppointmentHistory
from accounts.serializers import UserSerializer
from doctors.serializers import DoctorListSerializer, ClinicSerializer
from doctors.models import DoctorProfile

class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentStatus
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = DoctorListSerializer(read_only=True)
    clinic = ClinicSerializer(read_only=True)
    status = AppointmentStatusSerializer(read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('booking_id', 'created_at', 'updated_at')

class CreateAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor', 'clinic', 'appointment_date', 'appointment_time', 
                 'symptoms', 'consultation_fee']

    def validate(self, data):
        """
        Check for booking conflicts before creating appointment.
        """
        patient = self.context['request'].user
        doctor = data.get('doctor')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')

        # Get valid active statuses
        try:
            active_statuses = AppointmentStatus.objects.filter(
                name__in=['scheduled', 'confirmed']
            )
            active_status_names = [status.name for status in active_statuses if status.name]
        except Exception:
            active_status_names = ['scheduled', 'confirmed']

        # Check if doctor is already booked at this time
        doctor_conflict = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__name__in=active_status_names
        ).exists()

        if doctor_conflict:
            raise serializers.ValidationError({
                'appointment_time': f'This doctor is already booked at {appointment_time} on {appointment_date}. Please select a different time slot.'
            })

        # Check if patient already has an appointment with this doctor at this time
        patient_conflict = Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__name__in=active_status_names
        ).exists()

        if patient_conflict:
            raise serializers.ValidationError({
                'appointment_time': 'You already have an appointment with this doctor at this time.'
            })

        # Check if patient has too many appointments on the same day
        daily_appointments = Appointment.objects.filter(
            patient=patient,
            appointment_date=appointment_date,
            status__name__in=active_status_names
        ).count()

        if daily_appointments >= 3:  # Limit to 3 appointments per day per patient
            raise serializers.ValidationError({
                'appointment_date': 'You can only book up to 3 appointments per day.'
            })

        return data

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        
        # Set default status to 'scheduled'
        try:
            scheduled_status = AppointmentStatus.objects.get(name='scheduled')
            validated_data['status'] = scheduled_status
        except AppointmentStatus.DoesNotExist:
            # Create scheduled status if it doesn't exist
            scheduled_status = AppointmentStatus.objects.create(
                name='scheduled',
                description='Appointment scheduled and awaiting confirmation'
            )
            validated_data['status'] = scheduled_status
        
        try:
            return super().create(validated_data)
        except IntegrityError as e:
            # Handle any unexpected database constraint violations
            raise serializers.ValidationError({
                'non_field_errors': 'Unable to create appointment due to a database constraint.'
            })

class AppointmentHistorySerializer(serializers.ModelSerializer):
    old_status_name = serializers.CharField(source='old_status.name', read_only=True)
    new_status_name = serializers.CharField(source='new_status.name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = AppointmentHistory
        fields = '__all__'