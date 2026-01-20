from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Sermon(models.TitleChoices if False else models.Model): # Placeholder for safety, using models.Model
    title = models.CharField(_('Titre'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    slug = models.SlugField(unique=True, blank=True)
    
    pastor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sermons',
        limit_choices_to={'role__in': ['PASTOR', 'ADMIN']}
    )
    
    youtube_url = models.URLField(_('Lien YouTube'), blank=True, null=True)
    series = models.CharField(_('Série'), max_length=255, blank=True, null=True)
    class Category(models.TextChoices):
        SUNDAY_SERVICE = 'SUNDAY_SERVICE', _('Culte Dimanche')
        PREACHING = 'PREACHING', _('Prédication')
        TEACHING = 'TEACHING', _('Enseignement')
        EXHORTATION = 'EXHORTATION', _('Exhortation')
        MEDITATION = 'MEDITATION', _('Méditation')
        BIBLE_STUDY = 'BIBLE_STUDY', _('Étude Biblique')
        YOUTH = 'YOUTH', _('Jeunesse')
        CONFERENCE = 'CONFERENCE', _('Conférence')
        WORSHIP = 'WORSHIP', _('Louange')
        OTHER = 'OTHER', _('Autre')

    category = models.CharField(
        _('Catégorie'),
        max_length=20,
        choices=Category.choices,
        default=Category.SUNDAY_SERVICE
    )

    pdf_file = models.FileField(_('Fichier PDF'), upload_to='sermons/pdfs/', blank=True, null=True)
    cover_image = models.ImageField(_('Image de couverture'), upload_to='sermons/covers/', blank=True, null=True)
    
    is_published = models.BooleanField(_('Publié'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Sermon')
        verbose_name_plural = _('Sermons')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class SermonComment(models.Model):
    sermon = models.ForeignKey(Sermon, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sermon_comments')
    content = models.TextField(_('Commentaire'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Commentaire de sermon')
        verbose_name_plural = _('Commentaires de sermons')
        ordering = ['-created_at']

    def __str__(self):
        return f"Commentaire de {self.user.username} sur {self.sermon.title}"
