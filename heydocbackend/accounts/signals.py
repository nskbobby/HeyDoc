from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, PatientProfile

@receiver(post_save, sender=CustomUser)
def create_patient_profile(sender, instance, created, **kwargs):
    """Create patient profile when a patient user is created."""
    if created and instance.is_patient and not instance.is_doctor:
        PatientProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_patient_profile(sender, instance, **kwargs):
    """Save patient profile when user is saved."""
    if instance.is_patient and hasattr(instance, 'patient_profile'):
        instance.patient_profile.save()