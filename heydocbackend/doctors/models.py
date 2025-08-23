from django.db import models
from accounts.models import CustomUser
from locations.models import Area
import json
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from .managers import DoctorProfileManager

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctors_specialization'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def doctor_count(self):
        """Return number of doctors with this specialization."""
        return self.doctors.filter(is_available=True).count()

class DoctorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    license_number = models.CharField(max_length=50, unique=True)
    specializations = models.ManyToManyField(Specialization, related_name='doctors')
    years_of_experience = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00,
                                validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    languages = models.TextField(blank=True)  # JSON field
    education = models.TextField(blank=True)  # JSON field
    awards = models.TextField(blank=True)  # JSON field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = DoctorProfileManager()

    class Meta:
        db_table = 'doctors_doctorprofile'
        ordering = ['-rating', '-total_reviews']

    def __str__(self):
        return f"Dr. {self.user.get_full_name()}"

    @property
    def display_name(self):
        """Return formatted doctor name for frontend."""
        return f"Dr. {self.user.get_full_name()}"

    @property
    def specialization_names(self):
        """Return comma-separated specialization names for frontend."""
        return ", ".join(self.specializations.values_list('name', flat=True))

    @property
    def experience_level(self):
        """Return experience level based on years."""
        if self.years_of_experience < 2:
            return "Junior"
        elif self.years_of_experience < 10:
            return "Experienced"
        else:
            return "Senior"

    @property
    def rating_stars(self):
        """Return rating as number of stars."""
        return int(self.rating)

    @property
    def primary_clinic(self):
        """Return primary clinic for frontend."""
        return self.clinics.filter(is_primary=True).first()

    def get_languages(self):
        """Return languages as list."""
        try:
            return json.loads(self.languages) if self.languages else []
        except json.JSONDecodeError:
            return []

    def set_languages(self, language_list):
        """Set languages from list."""
        self.languages = json.dumps(language_list)

    def get_education(self):
        """Return education as list."""
        try:
            return json.loads(self.education) if self.education else []
        except json.JSONDecodeError:
            return []

    def set_education(self, education_list):
        """Set education from list."""
        self.education = json.dumps(education_list)

    def get_awards(self):
        """Return awards as list."""
        try:
            return json.loads(self.awards) if self.awards else []
        except json.JSONDecodeError:
            return []

    def set_awards(self, awards_list):
        """Set awards from list."""
        self.awards = json.dumps(awards_list)

    def update_rating(self):
        """Update rating based on reviews."""
        reviews = self.reviews_received.filter(is_approved=True)
        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.rating = round(avg_rating, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=['rating', 'total_reviews'])

    def can_be_booked(self):
        """Check if doctor can be booked."""
        return self.is_available and self.is_verified


         # Frontend dependency methods
    def get_available_slots(self, date):
        """Get available appointment slots for a date."""
        from datetime import datetime, timedelta
        
        slots = []
        schedules = self.schedules.filter(
            day_of_week=date.weekday(),
            is_active=True
        )
        
        for schedule in schedules:
            current_time = datetime.combine(date, schedule.start_time)
            end_time = datetime.combine(date, schedule.end_time)
            
            while current_time < end_time:
                # Check if slot is available
                if not self.doctor_appointments.filter(
                    appointment_date=date,
                    appointment_time=current_time.time(),
                    status__name__in=['scheduled', 'confirmed']
                ).exists():
                    slots.append({
                        'time': current_time.time(),
                        'clinic': schedule.clinic
                    })
                
                current_time += timedelta(minutes=schedule.slot_duration)
        
        return slots

class Clinic(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='clinics')
    name = models.CharField(max_length=200)
    address = models.TextField()
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, related_name='clinics')
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    facilities = models.TextField(blank=True)  # JSON field
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors_clinic'

    def __str__(self):
        return f"{self.name} - {self.doctor.display_name}"

    @property
    def full_address(self):
        """Return full formatted address for frontend."""
        address_parts = [self.address]
        if self.area:
            address_parts.append(self.area.name)
            if self.area.city:
                address_parts.append(self.area.city.name)
                if self.area.city.state:
                    address_parts.append(self.area.city.state.name)
        return ", ".join(address_parts)

    # Frontend dependency properties
    @property
    def area_name(self):
        """Return area name for frontend serializer."""
        return self.area.name if self.area else None

    @property
    def city_name(self):
        """Return city name for frontend serializer."""
        return self.area.city.name if self.area and self.area.city else None

    def get_facilities(self):
        """Return facilities as list."""
        try:
            return json.loads(self.facilities) if self.facilities else []
        except json.JSONDecodeError:
            return []

    def set_facilities(self, facilities_list):
        """Set facilities from list."""
        self.facilities = json.dumps(facilities_list)

    def save(self, *args, **kwargs):
        """Override save to ensure only one primary clinic per doctor."""
        if self.is_primary:
            # Set all other clinics for this doctor as non-primary
            Clinic.objects.filter(doctor=self.doctor, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

class Schedule(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='schedules')
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration = models.PositiveIntegerField(default=30)  # in minutes
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors_schedule'
        unique_together = ['doctor', 'clinic', 'day_of_week']

    def __str__(self):
        return f"{self.doctor.display_name} - {self.get_day_of_week_display()} ({self.start_time}-{self.end_time})"

    # Frontend dependency properties
    @property
    def day_name(self):
        """Return day name for frontend serializer."""
        return self.get_day_of_week_display()

    @property
    def clinic_name(self):
        """Return clinic name for frontend serializer."""
        return self.clinic.name

    @property
    def duration_hours(self):
        """Calculate schedule duration in hours."""
        from datetime import datetime, timedelta
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        if end < start:  # Handle overnight schedules
            end += timedelta(days=1)
        return (end - start).total_seconds() / 3600

    @property
    def total_slots(self):
        """Calculate total number of slots."""
        return int((self.duration_hours * 60) / self.slot_duration)

class Unavailability(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='unavailabilities')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    reason = models.CharField(max_length=200, blank=True)
    is_full_day = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctors_unavailability'
        verbose_name_plural = 'unavailabilities'
        ordering = ['date', 'start_time']

    def __str__(self):
        if self.is_full_day:
            return f"{self.doctor.display_name} - {self.date} (Full Day)"
        return f"{self.doctor.display_name} - {self.date} ({self.start_time}-{self.end_time})"

    @property
    def duration_display(self):
        """Return formatted duration display."""
        if self.is_full_day:
            return "Full Day"
        elif self.start_time and self.end_time:
            return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
        return "Unknown"
