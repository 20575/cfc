from rest_framework import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'author', 'author_name', 
            'is_active', 'created_at', 'expires_at'
        ]
        read_only_fields = ['author', 'created_at']
