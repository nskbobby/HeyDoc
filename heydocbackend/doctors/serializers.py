from rest_framework import serializers
from .models import DoctorProfile, Specialization, Clinic, Schedule
from accounts.serializers import UserSerializer

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class ClinicSerializer(serializers.ModelSerializer):
    area_name = serializers.CharField(source='area.name', read_only=True)
    city_name = serializers.CharField(source='area.city.name', read_only=True)
    
    class Meta:
        model = Clinic
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    
    class Meta:
        model = Schedule
        fields = '__all__'

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)
    clinics = ClinicSerializer(many=True, read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class DoctorListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)
    primary_clinic = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specializations', 'years_of_experience', 
                 'consultation_fee', 'rating', 'total_reviews', 'is_verified', 
                 'is_available', 'primary_clinic']
    
    def get_primary_clinic(self, obj):
        clinic = obj.clinics.filter(is_primary=True).first()
        return ClinicSerializer(clinic).data if clinic else None