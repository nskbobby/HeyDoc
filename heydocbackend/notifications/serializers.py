from rest_framework import serializers
from .models import Notification, NotificationType

class NotificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationType
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')