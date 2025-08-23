from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DoctorProfile, Clinic

@receiver(post_save, sender=Clinic)
def ensure_primary_clinic(sender, instance, **kwargs):
    """Ensure doctor has at least one primary clinic."""
    if not instance.doctor.clinics.filter(is_primary=True).exists():
        instance.is_primary = True
        instance.save()