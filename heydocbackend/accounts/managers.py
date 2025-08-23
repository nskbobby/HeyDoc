from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    """Custom user manager for CustomUser model."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

    def get_doctors(self):
        """Get all users who are doctors."""
        return self.filter(is_doctor=True, is_active=True)

    def get_patients(self):
        """Get all users who are patients."""
        return self.filter(is_patient=True, is_active=True)

    def get_verified_doctors(self):
        """Get all verified doctors."""
        return self.filter(is_doctor=True, is_active=True, doctor_profile__is_verified=True)
