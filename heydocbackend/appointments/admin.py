from django.contrib import admin
from .models import AppointmentStatus, Appointment, AppointmentHistory

@admin.register(AppointmentStatus)
class AppointmentStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'color')
    search_fields = ('name',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'payment_status')
    list_filter = ('status', 'payment_status', 'appointment_date')
    search_fields = ('booking_id', 'patient__email', 'doctor__user__email')
    date_hierarchy = 'appointment_date'
    readonly_fields = ('booking_id', 'created_at', 'updated_at')

@admin.register(AppointmentHistory)
class AppointmentHistoryAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'old_status', 'new_status', 'changed_by', 'created_at')
    list_filter = ('old_status', 'new_status')
    search_fields = ('appointment__booking_id',)
    readonly_fields = ('created_at',)