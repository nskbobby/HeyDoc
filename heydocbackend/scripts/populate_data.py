"""
Script to populate initial data for HeyDoc application
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'heydoc_backend.settings')
django.setup()

from locations.models import Country, State, City, Area
from doctors.models import Specialization
from appointments.models import AppointmentStatus
from notifications.models import NotificationType

def create_countries():
    """Create initial countries"""
    countries = [
        {'name': 'United States', 'code': 'US'},
        {'name': 'Canada', 'code': 'CA'},
        {'name': 'United Kingdom', 'code': 'GB'},
        {'name': 'Australia', 'code': 'AU'},
        {'name': 'India', 'code': 'IN'},
    ]
    
    for country_data in countries:
        country, created = Country.objects.get_or_create(
            code=country_data['code'],
            defaults={'name': country_data['name']}
        )
        if created:
            print(f"Created country: {country.name}")

def create_us_states():
    """Create US states"""
    us = Country.objects.get(code='US')
    states = [
        {'name': 'California', 'code': 'CA'},
        {'name': 'New York', 'code': 'NY'},
        {'name': 'Texas', 'code': 'TX'},
        {'name': 'Florida', 'code': 'FL'},
        {'name': 'Illinois', 'code': 'IL'},
    ]
    
    for state_data in states:
        state, created = State.objects.get_or_create(
            name=state_data['name'],
            country=us,
            defaults={'code': state_data['code']}
        )
        if created:
            print(f"Created state: {state.name}")

def create_specializations():
    """Create medical specializations"""
    specializations = [
        {'name': 'General Medicine', 'description': 'Primary healthcare and general medical conditions'},
        {'name': 'Cardiology', 'description': 'Heart and cardiovascular system disorders'},
        {'name': 'Dermatology', 'description': 'Skin, hair, and nail conditions'},
        {'name': 'Pediatrics', 'description': 'Medical care for infants, children, and adolescents'},
        {'name': 'Orthopedics', 'description': 'Bone, joint, and muscle disorders'},
        {'name': 'Neurology', 'description': 'Nervous system disorders'},
        {'name': 'Psychiatry', 'description': 'Mental health and psychiatric disorders'},
        {'name': 'Gynecology', 'description': 'Women\'s reproductive health'},
        {'name': 'Ophthalmology', 'description': 'Eye and vision care'},
        {'name': 'ENT', 'description': 'Ear, nose, and throat disorders'},
        {'name': 'Dentistry', 'description': 'Dental and oral health care'},
        {'name': 'Gastroenterology', 'description': 'Digestive system disorders'},
    ]
    
    for spec_data in specializations:
        spec, created = Specialization.objects.get_or_create(
            name=spec_data['name'],
            defaults={'description': spec_data['description']}
        )
        if created:
            print(f"Created specialization: {spec.name}")

def create_appointment_statuses():
    """Create appointment statuses"""
    statuses = [
        {'name': 'scheduled', 'description': 'Appointment is scheduled', 'color': '#3B82F6'},
        {'name': 'confirmed', 'description': 'Appointment is confirmed', 'color': '#10B981'},
        {'name': 'completed', 'description': 'Appointment is completed', 'color': '#6B7280'},
        {'name': 'cancelled', 'description': 'Appointment is cancelled', 'color': '#EF4444'},
        {'name': 'no_show', 'description': 'Patient did not show up', 'color': '#F59E0B'},
    ]
    
    for status_data in statuses:
        status, created = AppointmentStatus.objects.get_or_create(
            name=status_data['name'],
            defaults={
                'description': status_data['description'],
                'color': status_data['color']
            }
        )
        if created:
            print(f"Created appointment status: {status.name}")

def create_notification_types():
    """Create notification types"""
    types = [
        {'name': 'appointment_reminder', 'description': 'Appointment reminder notifications', 'is_email': True, 'is_push': True},
        {'name': 'appointment_confirmed', 'description': 'Appointment confirmation notifications', 'is_email': True, 'is_push': True},
        {'name': 'appointment_cancelled', 'description': 'Appointment cancellation notifications', 'is_email': True, 'is_push': True},
        {'name': 'new_review', 'description': 'New review notifications for doctors', 'is_push': True},
        {'name': 'system_update', 'description': 'System update notifications', 'is_push': True},
    ]
    
    for type_data in types:
        notification_type, created = NotificationType.objects.get_or_create(
            name=type_data['name'],
            defaults={
                'description': type_data['description'],
                'is_email': type_data.get('is_email', False),
                'is_sms': type_data.get('is_sms', False),
                'is_push': type_data.get('is_push', True),
            }
        )
        if created:
            print(f"Created notification type: {notification_type.name}")

def main():
    """Run all data population functions"""
    print("Starting data population...")
    
    create_countries()
    create_us_states()
    create_specializations()
    create_appointment_statuses()
    create_notification_types()
    
    print("Data population completed!")

if __name__ == '__main__':
    main()