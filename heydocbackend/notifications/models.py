from django.db import models
from accounts.models import CustomUser
import json

class NotificationType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_email = models.BooleanField(default=False)
    is_sms = models.BooleanField(default=False)
    is_push = models.BooleanField(default=True)

    class Meta:
        db_table = 'notifications_notificationtype'

    def __str__(self):
        return self.name

    @property
    def delivery_methods(self):
        """Return list of enabled delivery methods."""
        methods = []
        if self.is_email:
            methods.append('email')
        if self.is_sms:
            methods.append('sms')
        if self.is_push:
            methods.append('push')
        return methods

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.TextField(blank=True)  # JSON field for additional data
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"

    # Frontend dependency properties
    @property
    def type_name(self):
        """Return notification type name for frontend serializer."""
        return self.type.name

    @property
    def is_recent(self):
        """Check if notification is recent (within 24 hours)."""
        from datetime import timedelta
        from django.utils import timezone
        return self.created_at >= timezone.now() - timedelta(hours=24)

    @property
    def time_since_created(self):
        """Return human-readable time since creation."""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - self.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        else:
            return self.created_at.strftime("%B %d, %Y")

    def get_data(self):
        """Return data as dictionary."""
        try:
            return json.loads(self.data) if self.data else {}
        except json.JSONDecodeError:
            return {}

    def set_data(self, data_dict):
        """Set data from dictionary."""
        self.data = json.dumps(data_dict)

    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])

    def mark_as_unread(self):
        """Mark notification as unread."""
        if self.is_read:
            self.is_read = False
            self.save(update_fields=['is_read'])

    @classmethod
    def create_notification(cls, user, notification_type, title, message, data=None):
        """Create a new notification."""
        if isinstance(notification_type, str):
            notification_type = NotificationType.objects.get(name=notification_type)
        
        notification = cls.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message
        )
        if data:
            notification.set_data(data)
            notification.save()
        return notification

    @classmethod
    def mark_all_as_read_for_user(cls, user):
        """Mark all notifications as read for a user."""
        cls.objects.filter(user=user, is_read=False).update(is_read=True)

    @classmethod
    def get_unread_count_for_user(cls, user):
        """Get unread notification count for a user."""
        return cls.objects.filter(user=user, is_read=False).count()