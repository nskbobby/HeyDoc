from rest_framework import serializers
from .models import Review, ReviewHelpful
from accounts.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('patient', 'helpful_count', 'created_at', 'updated_at')

    def get_patient_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.patient.get_full_name()

class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['doctor', 'appointment', 'rating', 'title', 'comment', 'is_anonymous']

    def validate(self, data):
        patient = self.context['request'].user
        doctor = data.get('doctor')
        appointment = data.get('appointment')
        
        # Check if review already exists for this appointment
        if appointment and Review.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment=appointment
        ).exists():
            raise serializers.ValidationError({
                'non_field_errors': ['You have already reviewed this appointment.']
            })
        
        # Verify the appointment belongs to the patient
        if appointment and appointment.patient != patient:
            raise serializers.ValidationError({
                'appointment': ['You can only review your own appointments.']
            })
            
        # Verify the appointment is with the specified doctor
        if appointment and appointment.doctor != doctor:
            raise serializers.ValidationError({
                'doctor': ['Doctor does not match the appointment.']
            })
            
        # Verify appointment is completed
        if appointment and appointment.status.name.lower() != 'completed':
            raise serializers.ValidationError({
                'appointment': ['You can only review completed appointments.']
            })
        
        return data

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)