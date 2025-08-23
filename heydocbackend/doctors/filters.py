import django_filters
from .models import DoctorProfile

class DoctorFilter(django_filters.FilterSet):
    specialization = django_filters.CharFilter(field_name='specializations__name', lookup_expr='icontains')
    min_fee = django_filters.NumberFilter(field_name='consultation_fee', lookup_expr='gte')
    max_fee = django_filters.NumberFilter(field_name='consultation_fee', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    experience = django_filters.NumberFilter(field_name='years_of_experience', lookup_expr='gte')
    city = django_filters.CharFilter(field_name='clinics__area__city__name', lookup_expr='icontains')
    area = django_filters.CharFilter(field_name='clinics__area__name', lookup_expr='icontains')

    class Meta:
        model = DoctorProfile
        fields = ['is_verified', 'is_available']