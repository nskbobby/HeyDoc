from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta

class AppointmentManager(models.Manager):
    """Custom manager for Appointment model."""
    
    def upcoming(self):
        """Get upcoming appointments."""
        return self.filter(
            appointment_date__gte=timezone.now().date(),
            status__name__in=['scheduled', 'confirmed']
        )

    def today(self):
        """Get today's appointments."""
        return self.filter(appointment_date=timezone.now().date())

    def past(self):
        """Get past appointments."""
        now = timezone.now()
        return self.filter(
            models.Q(appointment_date__lt=now.date()) |
            models.Q(appointment_date=now.date(), appointment_time__lt=now.time())
        )

    def for_patient(self, patient):
        """Get appointments for a specific patient."""
        return self.filter(patient=patient)

    def for_doctor(self, doctor):
        """Get appointments for a specific doctor."""
        return self.filter(doctor=doctor)

    def by_status(self, status_name):
        """Get appointments by status."""
        return self.filter(status__name=status_name)

    def pending_payment(self):
        """Get appointments with pending payment."""
        return self.filter(payment_status='pending')

    def completed(self):
        """Get completed appointments."""
        return self.filter(status__name='completed')

    def cancelled(self):
        """Get cancelled appointments."""
        return self.filter(status__name='cancelled')
