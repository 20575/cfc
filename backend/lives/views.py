from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import LiveStream
from .serializers import LiveStreamSerializer

class LiveStreamViewSet(viewsets.ModelViewSet):
    queryset = LiveStream.objects.all()
    serializer_class = LiveStreamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Les membres ne voient que les lives actifs ou planifiés
        if self.request.user.role == 'MEMBER':
            return LiveStream.objects.filter(status__in=['LIVE', 'PLANNED'])
        return super().get_queryset()

    @action(detail=True, methods=['post'])
    def start_stream(self, request, pk=None):
        live = self.get_object()
        if live.pastor != request.user and request.user.role != 'ADMIN':
            return Response({"error": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        
        # Simulation AWS IVS (en attendant l'intégration réelle)
        if not live.stream_key:
            live.stream_key = f"sk_cfc_{live.id}_test"
            live.playback_url = "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8" # URL de démo IVS
            live.ingest_endpoint = "rtmps://fcc3ddae59ed.global-contribute.live-video.net:443/app/"

        live.status = 'LIVE'
        live.started_at = timezone.now()
        live.save()
        
        return Response(LiveStreamSerializer(live).data)

    @action(detail=True, methods=['post'])
    def stop_stream(self, request, pk=None):
        live = self.get_object()
        if live.pastor != request.user and request.user.role != 'ADMIN':
            return Response({"error": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        
        live.status = 'ENDED'
        live.ended_at = timezone.now()
        live.save()
        
        return Response(LiveStreamSerializer(live).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def active(self, request):
        # Récupérer le live en cours le plus récent
        active_live = LiveStream.objects.filter(status='LIVE').first()
        if active_live:
            return Response(LiveStreamSerializer(active_live).data)
        return Response(None, status=status.HTTP_204_NO_CONTENT)
