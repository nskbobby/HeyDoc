import django_filters
from .models import Appointment

class AppointmentFilter(django_filters.FilterSet):
    appointment_date = django_filters.DateFromToRangeFilter()
    status = django_filters.CharFilter(field_name='status__name', lookup_expr='iexact')
    
    class Meta:
        model = Appointment
        fields = ['appointment_date', 'status', 'payment_status']