from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import date
import os
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    username = None
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$')
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_doctor = models.BooleanField(default=False)
    is_patient = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'accounts_customuser'

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """Return the user's short name."""
        return self.first_name

    @property
    def age(self):
        """Calculate and return user's age."""
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    @property
    def profile_picture_url(self):
        """Return profile picture URL or default avatar."""
        if self.profile_picture and hasattr(self.profile_picture, 'url'):
            return self.profile_picture.url
        return '/static/images/default-avatar.jpg'

    def delete_profile_picture(self):
        """Delete the profile picture file."""
        if self.profile_picture:
            if os.path.isfile(self.profile_picture.path):
                os.remove(self.profile_picture.path)

    def save(self, *args, **kwargs):
        """Override save to handle profile picture deletion."""
        if self.pk:
            try:
                old_instance = CustomUser.objects.get(pk=self.pk)
                if old_instance.profile_picture and old_instance.profile_picture != self.profile_picture:
                    old_instance.delete_profile_picture()
            except CustomUser.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def get_role_display(self):
        """Return user role as string."""
        if self.is_doctor:
            return "Doctor"
        elif self.is_patient:
            return "Patient"
        return "User"

    # Methods for frontend notification dependencies
    def get_unread_notifications_count(self):
        """Get count of unread notifications for this user."""
        return self.notifications.filter(is_read=False).count()
    
    def get_recent_notifications(self, limit=5):
        """Get recent notifications for this user."""
        return self.notifications.order_by('-created_at')[:limit]

    def mark_all_notifications_read(self):
        """Mark all notifications as read for this user."""
        self.notifications.filter(is_read=False).update(is_read=True)

class PatientProfile(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=17, blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True)
    allergies = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    insurance_provider = models.CharField(max_length=100, blank=True)
    insurance_number = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_patientprofile'

    def __str__(self):
        return f"Patient Profile - {self.user.get_full_name()}"

    @property
    def has_emergency_contact(self):
        """Check if emergency contact information is available."""
        return bool(self.emergency_contact_name and self.emergency_contact_phone)

    @property
    def has_insurance(self):
        """Check if insurance information is available."""
        return bool(self.insurance_provider and self.insurance_number)

    def get_allergies_list(self):
        """Return allergies as a list."""
        if self.allergies:
            return [allergy.strip() for allergy in self.allergies.split(',')]
        return []

    def add_allergy(self, allergy):
        """Add a new allergy."""
        allergies = self.get_allergies_list()
        if allergy not in allergies:
            allergies.append(allergy)
            self.allergies = ', '.join(allergies)
            self.save()

    def remove_allergy(self, allergy):
        """Remove an allergy."""
        allergies = self.get_allergies_list()
        if allergy in allergies:
            allergies.remove(allergy)
            self.allergies = ', '.join(allergies)
            self.save()

## accounts/signals.py
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
