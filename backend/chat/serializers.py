from rest_framework import serializers
from .models import Message
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    receiver_details = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'receiver', 'message_type', 'appointment', 
            'donation', 'content', 'timestamp', 'is_read',
            'sender_details', 'receiver_details'
        ]
        read_only_fields = ['sender', 'timestamp', 'is_read']

    def create(self, validated_data):
        # The sender is automatically the current user
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
