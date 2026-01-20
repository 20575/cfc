from django.db import models
from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Si c'est un membre, on filtre pour ne montrer que les actives et non expirées
        # Et selon la demande, SEULEMENT les membres voient les annonces
        if not user.is_staff and user.role == 'MEMBER':
            now = timezone.now()
            return queryset.filter(
                is_active=True
            ).filter(
                models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=now)
            )
        
        # Si c'est un admin/staff, on montre tout pour gestion
        if user.is_staff:
            return queryset
            
        # Pour les autres (ex: Pasteurs qui ne sont pas staff ou si on suit strictement la consigne)
        # S'ils ne sont pas membres, ils ne voient rien (retourne vide)
        return Announcement.objects.none()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
