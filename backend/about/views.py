from rest_framework import viewsets, permissions
from .models import InformationSection, Event, GalleryItem, Visionary
from .serializers import InformationSectionSerializer, EventSerializer, GalleryItemSerializer, VisionarySerializer
from users.permissions import IsAdminOrReadOnlyPublic

from rest_framework.parsers import MultiPartParser, FormParser

class InformationSectionViewSet(viewsets.ModelViewSet):
    queryset = InformationSection.objects.all()
    serializer_class = InformationSectionSerializer
    permission_classes = [IsAdminOrReadOnlyPublic]
    parser_classes = (MultiPartParser, FormParser)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        # Automatic Archive Logic based on Date
        import datetime
        today = datetime.date.today()
        
        show_archive = self.request.query_params.get('archive')
        is_annual = self.request.query_params.get('is_annual')
        
        if is_annual is not None:
             queryset = queryset.filter(is_annual=is_annual.lower() == 'true')

        if show_archive is not None:
            if show_archive.lower() == 'true':
                # Archive: Events before today
                queryset = queryset.filter(date__lt=today)
            else:
                # Active: Upcoming events (today or future)
                queryset = queryset.filter(date__gte=today)
        
        # Fallback to existing manual fields if specific params not used, 
        # but the request implies automatic handling.
        # Let's keep manual 'is_past' for backward compat if explicitly requested
        manual_is_past = self.request.query_params.get('is_past')
        if manual_is_past is not None:
             queryset = queryset.filter(is_past=manual_is_past.lower() == 'true')
             
        # Default ordering: Nearest future events first, then furthest.
        # For archive: Most recent past events first.
        if show_archive and show_archive.lower() == 'true':
            ordering = ['-date'] # Newest archive first
        else:
            ordering = ['-is_pinned', 'date'] # Pinned first, then soonest upcoming
            
        return queryset.order_by(*ordering)

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VisionaryViewSet(viewsets.ModelViewSet):
    queryset = Visionary.objects.filter(is_active=True)
    serializer_class = VisionarySerializer
    permission_classes = [IsAdminOrReadOnlyPublic]
    parser_classes = (MultiPartParser, FormParser)
