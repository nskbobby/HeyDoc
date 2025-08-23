from django.contrib import admin
from .models import NotificationType, Notification

@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_email', 'is_sms', 'is_push')
    list_filter = ('is_email', 'is_sms', 'is_push')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'is_read', 'sent_at', 'created_at')
    list_filter = ('type', 'is_read', 'sent_at')
    search_fields = ('title', 'user__email')
    date_hierarchy = 'created_at'