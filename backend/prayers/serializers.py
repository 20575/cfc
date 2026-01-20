from rest_framework import serializers
from .models import PrayerRequest
from users.serializers import UserSerializer

class PrayerRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    description = serializers.CharField(source='content', required=False)

    class Meta:
        model = PrayerRequest
        fields = (
            'id', 'user', 'full_name', 'email', 'title', 'content', 'description',
            'status', 'status_display', 'is_anonymous', 'created_at'
        )
        read_only_fields = ('user', 'created_at')

    def validate(self, data):
        request = self.context.get('request')
        if request and not request.user.is_authenticated:
            if not data.get('full_name') and not data.get('is_anonymous'):
                data['full_name'] = 'Anonyme'
        return data
