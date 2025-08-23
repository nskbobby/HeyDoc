from django.contrib import admin
from .models import Specialization, DoctorProfile, Clinic, Schedule, Unavailability

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'years_of_experience', 'consultation_fee', 'rating', 'is_verified', 'is_available')
    list_filter = ('is_verified', 'is_available', 'specializations')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'license_number')
    filter_horizontal = ('specializations',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'license_number', 'specializations', 'years_of_experience', 'bio')
        }),
        ('Professional Details', {
            'fields': ('consultation_fee', 'rating', 'total_reviews', 'is_verified', 'is_available')
        }),
        ('Additional Information', {
            'fields': ('languages', 'education', 'awards')
        }),
    )

@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ('name', 'doctor', 'area', 'is_primary')
    list_filter = ('is_primary', 'area__city')
    search_fields = ('name', 'doctor__user__first_name', 'doctor__user__last_name')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'clinic', 'get_day_of_week_display', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')

@admin.register(Unavailability)
class UnavailabilityAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'start_time', 'end_time', 'is_full_day', 'reason')
    list_filter = ('is_full_day', 'date')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')