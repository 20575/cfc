from rest_framework import serializers
from .models import LiveStream
from users.serializers import UserSerializer

class LiveStreamSerializer(serializers.ModelSerializer):
    pastor_details = UserSerializer(source='pastor', read_only=True)

    class Meta:
        model = LiveStream
        fields = '__all__'
        read_only_fields = ['pastor', 'started_at', 'ended_at', 'created_at', 'stream_key', 'playback_url', 'ingest_endpoint']

    def create(self, validated_data):
        validated_data['pastor'] = self.context['request'].user
        return super().create(validated_data)
