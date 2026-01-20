from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Event, GalleryItem
from .serializers import EventSerializer, GalleryItemSerializer
from django.db.models import Q
from users.permissions import IsPastorOrAdmin

class AdminEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des événements par les administrateurs
    """
    queryset = Event.objects.all().order_by('-is_pinned', '-date')
    serializer_class = EventSerializer
    permission_classes = [IsPastorOrAdmin]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(location__icontains=search) |
                Q(category__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset

class AdminGalleryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion de la galerie par les administrateurs
    """
    queryset = GalleryItem.objects.all().order_by('-created_at')
    serializer_class = GalleryItemSerializer
    permission_classes = [IsPastorOrAdmin]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(caption__icontains=search)
            )
            
        return queryset

    @action(detail=False, methods=['POST'])
    def bulk_upload(self, request):
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided'}, status=400)
            
        if len(images) > 7:
            return Response({'error': 'Maximum 7 images allowed'}, status=400)
            
        created_items = []
        for img in images:
            item = GalleryItem.objects.create(
                image=img,
                title=request.data.get('title', ''),
                caption=request.data.get('caption', '')
            )
            created_items.append(GalleryItemSerializer(item).data)
            
        return Response(created_items, status=201)
