from django.core.exceptions import ValidationError
from django.utils import timezone
import re

def validate_phone_number(value):
    """Validate phone number format"""
    phone_regex = re.compile(r'^\+?1?\d{9,15}$')
    if not phone_regex.match(value):
        raise ValidationError('Phone number must be in format: +999999999. Up to 15 digits allowed.')

def validate_future_date(value):
    """Validate that date is in the future"""
    if value <= timezone.now().date():
        raise ValidationError('Date must be in the future.')

def validate_business_hours(value):
    """Validate that time is within business hours (6 AM to 10 PM)"""
    if not (6 <= value.hour <= 22):
        raise ValidationError('Time must be between 6:00 AM and 10:00 PM.')

def validate_license_number(value):
    """Validate medical license number format"""
    # This is a simple example - adjust based on your country's format
    if len(value) < 5:
        raise ValidationError('License number must be at least 5 characters long.')