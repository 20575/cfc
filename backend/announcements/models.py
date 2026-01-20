from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Announcement(models.Model):
    title = models.CharField(_('Titre'), max_length=255)
    content = models.TextField(_('Contenu'))
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(_('Expire le'), null=True, blank=True)

    class Meta:
        verbose_name = _('Annonce')
        verbose_name_plural = _('Annonces')
        ordering = ['-created_at']

    def __str__(self):
        return self.title
