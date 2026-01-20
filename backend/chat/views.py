from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # L'admin peut voir tous les messages de support
        if user.role == 'ADMIN' or user.is_superuser:
            return Message.objects.all()
        # Les pasteurs voient les messages où ils sont impliqués
        # Les membres voient les messages où ils sont impliqués
        return Message.objects.filter(Q(sender=user) | Q(receiver=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filtres optionnels
        msg_type = request.query_params.get('type')
        if msg_type:
            queryset = queryset.filter(message_type=msg_type)
            
        donation_id = request.query_params.get('donation')
        if donation_id:
            queryset = queryset.filter(donation_id=donation_id)
            
        appointment_id = request.query_params.get('appointment')
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        is_read = request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
