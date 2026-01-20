from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class LiveStream(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', _('Planifié')),
        ('LIVE', _('En Direct')),
        ('ENDED', _('Terminé')),
    ]

    title = models.CharField(_('Titre'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    pastor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='live_streams'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PLANNED'
    )
    
    # AWS IVS Details
    stream_key = models.CharField(_('Clé de Flux'), max_length=255, blank=True)
    playback_url = models.CharField(_('URL de Lecture'), max_length=512, blank=True)
    ingest_endpoint = models.CharField(_('Point d\'entrée (RTMP)'), max_length=512, blank=True)
    
    # Timing
    scheduled_start = models.DateTimeField(_('Début prévu'), null=True, blank=True)
    started_at = models.DateTimeField(_('Lancé à'), null=True, blank=True)
    ended_at = models.DateTimeField(_('Terminé à'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Flux Live')
        verbose_name_plural = _('Flux Lives')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
