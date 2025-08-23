from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import CustomUser
from doctors.models import DoctorProfile, Clinic
import uuid
from django.utils import timezone
from .managers import AppointmentManager

class AppointmentStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, blank=True)  # hex color

    class Meta:
        db_table = 'appointments_appointmentstatus'
        verbose_name_plural = 'appointment statuses'

    def __str__(self):
        return self.name

    @property
    def is_active_status(self):
        """Check if this is an active status (scheduled/confirmed)."""
        return self.name.lower() in ['scheduled', 'confirmed']

    @property
    def is_completed_status(self):
        """Check if this is a completed status."""
        return self.name.lower() in ['completed', 'cancelled', 'no_show']

class Appointment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    duration = models.PositiveIntegerField(default=30)  # in minutes
    status = models.ForeignKey(AppointmentStatus, on_delete=models.PROTECT)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    symptoms = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=100, blank=True)
    booking_id = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AppointmentManager()

    class Meta:
        db_table = 'appointments_appointment'
        ordering = ['-appointment_date', '-appointment_time']
        # We'll handle duplicate prevention in serializer validation instead of DB constraints
        # This allows more flexible validation based on appointment status

    def __str__(self):
        return f"{self.booking_id} - {self.patient.get_full_name()} with {self.doctor.display_name}"

    def save(self, *args, **kwargs):
        if not self.booking_id:
            self.booking_id = self.generate_booking_id()
        super().save(*args, **kwargs)

    def generate_booking_id(self):
        """Generate unique booking ID."""
        return f"HEY{uuid.uuid4().hex[:8].upper()}"

    # Frontend dependency properties
    @property
    def status_name(self):
        """Return status name for frontend serializer."""
        return self.status.name

    @property
    def appointment_datetime(self):
        """Return combined datetime object."""
        from datetime import datetime
        return datetime.combine(self.appointment_date, self.appointment_time)

    @property
    def is_past_due(self):
        """Check if appointment is past due."""
        return self.appointment_datetime < timezone.now()

    @property
    def is_today(self):
        """Check if appointment is today."""
        return self.appointment_date == timezone.now().date()

    @property
    def is_upcoming(self):
        """Check if appointment is upcoming."""
        return self.appointment_datetime > timezone.now()

    @property
    def can_be_cancelled(self):
        """Check if appointment can be cancelled."""
        # Can't cancel if already completed or past due
        if self.status.is_completed_status or self.is_past_due:
            return False
        # Can cancel up to 2 hours before appointment
        time_diff = self.appointment_datetime - timezone.now()
        return time_diff.total_seconds() > 7200  # 2 hours

    @property
    def can_be_rescheduled(self):
        """Check if appointment can be rescheduled."""
        return self.status.is_active_status and not self.is_past_due

    @property
    def time_until_appointment(self):
        """Return time until appointment."""
        if self.is_past_due:
            return None
        time_diff = self.appointment_datetime - timezone.now()
        return time_diff

    def get_reminder_time(self):
        """Get reminder time (24 hours before appointment)."""
        from datetime import timedelta
        return self.appointment_datetime - timedelta(hours=24)

    def cancel(self, reason=None, cancelled_by=None):
        """Cancel the appointment."""
        try:
            cancelled_status = AppointmentStatus.objects.get(name='cancelled')
            old_status = self.status
            self.status = cancelled_status
            self.save()
            
            # Create history entry
            AppointmentHistory.objects.create(
                appointment=self,
                old_status=old_status,
                new_status=cancelled_status,
                changed_by=cancelled_by,
                change_reason=reason or "Cancelled"
            )
            return True
        except AppointmentStatus.DoesNotExist:
            return False

    def confirm(self, confirmed_by=None):
        """Confirm the appointment."""
        try:
            confirmed_status = AppointmentStatus.objects.get(name='confirmed')
            old_status = self.status
            self.status = confirmed_status
            self.save()
            
            # Create history entry
            AppointmentHistory.objects.create(
                appointment=self,
                old_status=old_status,
                new_status=confirmed_status,
                changed_by=confirmed_by,
                change_reason="Appointment confirmed"
            )
            return True
        except AppointmentStatus.DoesNotExist:
            return False

    def complete(self, completed_by=None, notes=None, prescription=None):
        """Mark appointment as completed."""
        try:
            completed_status = AppointmentStatus.objects.get(name='completed')
            old_status = self.status
            self.status = completed_status
            if notes:
                self.notes = notes
            if prescription:
                self.prescription = prescription
            self.save()
            
            # Create history entry
            AppointmentHistory.objects.create(
                appointment=self,
                old_status=old_status,
                new_status=completed_status,
                changed_by=completed_by,
                change_reason="Appointment completed"
            )
            return True
        except AppointmentStatus.DoesNotExist:
            return False

class AppointmentHistory(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='history')
    old_status = models.ForeignKey(AppointmentStatus, on_delete=models.SET_NULL, null=True, related_name='old_status_history')
    new_status = models.ForeignKey(AppointmentStatus, on_delete=models.SET_NULL, null=True, related_name='new_status_history')
    changed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    change_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments_appointmenthistory'
        verbose_name_plural = 'appointment histories'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.appointment.booking_id} - {self.old_status} to {self.new_status}"

    # Frontend dependency properties
    @property
    def old_status_name(self):
        """Return old status name for frontend serializer."""
        return self.old_status.name if self.old_status else None

    @property
    def new_status_name(self):
        """Return new status name for frontend serializer."""
        return self.new_status.name if self.new_status else None

    @property
    def changed_by_name(self):
        """Return changed by name for frontend serializer."""
        return self.changed_by.get_full_name() if self.changed_by else None

    @property
    def status_change_display(self):
        """Return formatted status change."""
        old_name = self.old_status.name if self.old_status else "None"
        new_name = self.new_status.name if self.new_status else "None"
        return f"{old_name} → {new_name}"
