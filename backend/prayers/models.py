from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class PrayerRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('En attente')
        PRAYED = 'PRAYED', _('Soutenu en prière')
        RESOLVED = 'RESOLVED', _('Exaucé / Résolu')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prayer_requests'
    )
    full_name = models.CharField(_('Nom complet'), max_length=255, blank=True)
    email = models.EmailField(_('Email (optionnel)'), blank=True, null=True)
    title = models.CharField(_('Sujet de prière'), max_length=255)
    content = models.TextField(_('Contenu de la requête'))
    
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    is_anonymous = models.BooleanField(_('Rester anonyme'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Requête de prière')
        verbose_name_plural = _('Requêtes de prière')
        ordering = ['-created_at']

    def __str__(self):
        name = self.user.username if self.user else (self.full_name or "Anonyme")
        return f"Requête de {name} - {self.title}"
