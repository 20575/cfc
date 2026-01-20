from django.contrib import admin
from .models import Announcement

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_active', 'created_at', 'expires_at')
    list_filter = ('is_active', 'created_at', 'author')
    search_fields = ('title', 'content')
    raw_id_fields = ('author',)
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.author = request.user
        super().save_model(request, obj, form, change)
