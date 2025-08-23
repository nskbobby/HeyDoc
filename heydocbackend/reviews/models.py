from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import CustomUser
from doctors.models import DoctorProfile
from appointments.models import Appointment

class Review(models.Model):
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews_given')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='reviews_received')
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews_review'
        unique_together = ['patient', 'doctor', 'appointment']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating} stars for {self.doctor.display_name}"

    # Frontend dependency properties
    @property
    def patient_name(self):
        """Return patient name for frontend serializer (respects anonymity)."""
        if self.is_anonymous:
            return "Anonymous"
        return self.patient.get_full_name()

    @property
    def doctor_name(self):
        """Return doctor name for frontend serializer."""
        return self.doctor.display_name

    @property
    def reviewer_name(self):
        """Return reviewer name (anonymous if needed)."""
        if self.is_anonymous:
            return "Anonymous"
        return self.patient.get_full_name()

    @property
    def rating_stars(self):
        """Return rating as star string."""
        return "★" * self.rating + "☆" * (5 - self.rating)

    @property
    def is_recent(self):
        """Check if review is recent (within 30 days)."""
        from datetime import timedelta
        from django.utils import timezone
        return self.created_at >= timezone.now() - timedelta(days=30)

    def save(self, *args, **kwargs):
        """Override save to update doctor rating."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new or 'rating' in kwargs.get('update_fields', []):
            self.doctor.update_rating()

    def delete(self, *args, **kwargs):
        """Override delete to update doctor rating."""
        doctor = self.doctor
        super().delete(*args, **kwargs)
        doctor.update_rating()

    def mark_helpful(self, user, is_helpful=True):
        """Mark review as helpful/not helpful by user."""
        helpful, created = ReviewHelpful.objects.get_or_create(
            review=self,
            user=user,
            defaults={'is_helpful': is_helpful}
        )
        if not created:
            helpful.is_helpful = is_helpful
            helpful.save()
        self.update_helpful_count()

    def update_helpful_count(self):
        """Update helpful count based on votes."""
        self.helpful_count = self.helpful_votes.filter(is_helpful=True).count()
        self.save(update_fields=['helpful_count'])

class ReviewHelpful(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews_reviewhelpful'
        unique_together = ['review', 'user']

    def __str__(self):
        helpful_text = "helpful" if self.is_helpful else "not helpful"
        return f"{self.user.get_full_name()} found review {helpful_text}"
