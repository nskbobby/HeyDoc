from django.db import models
from django.db.models import Avg, Count, Q

class DoctorProfileManager(models.Manager):
    """Custom manager for DoctorProfile model."""
    
    def available(self):
        """Get available doctors."""
        return self.filter(is_available=True, user__is_active=True)

    def verified(self):
        """Get verified doctors."""
        return self.filter(is_verified=True, is_available=True, user__is_active=True)

    def by_specialization(self, specialization_name):
        """Get doctors by specialization."""
        return self.filter(specializations__name__icontains=specialization_name)

    def by_location(self, city_name=None, area_name=None):
        """Get doctors by location."""
        queryset = self.get_queryset()
        if city_name:
            queryset = queryset.filter(clinics__area__city__name__icontains=city_name)
        if area_name:
            queryset = queryset.filter(clinics__area__name__icontains=area_name)
        return queryset.distinct()

    def with_min_rating(self, min_rating):
        """Get doctors with minimum rating."""
        return self.filter(rating__gte=min_rating)

    def by_fee_range(self, min_fee=None, max_fee=None):
        """Get doctors by consultation fee range."""
        queryset = self.get_queryset()
        if min_fee:
            queryset = queryset.filter(consultation_fee__gte=min_fee)
        if max_fee:
            queryset = queryset.filter(consultation_fee__lte=max_fee)
        return queryset

    def with_experience(self, min_years):
        """Get doctors with minimum years of experience."""
        return self.filter(years_of_experience__gte=min_years)

    def top_rated(self, limit=10):
        """Get top rated doctors."""
        return self.available().order_by('-rating', '-total_reviews')[:limit]

    def most_reviewed(self, limit=10):
        """Get most reviewed doctors."""
        return self.available().order_by('-total_reviews', '-rating')[:limit]
