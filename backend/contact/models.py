from django.db import models
from django.utils.translation import gettext_lazy as _

class ContactRequest(models.Model):
    name = models.CharField(_('Nom'), max_length=255)
    email = models.EmailField(_('Email'))
    subject = models.CharField(_('Sujet'), max_length=255)
    message = models.TextField(_('Message'))
    
    is_read = models.BooleanField(_('Lu'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Message de contact')
        verbose_name_plural = _('Messages de contact')
        ordering = ['-created_at']

    def __str__(self):
        return f"Message de {self.name} - {self.subject}"

class ContactInfo(models.Model):
    phone = models.CharField(_('Téléphone'), max_length=50, default='+90 533 874 86 46')
    email = models.EmailField(_('Email'), default='cyprusforchrist@gmail.com')
    address = models.TextField(_('Adresse'), default='Turgut hasan sokak no 2, Kucuk kaymakli, Lefkosa, Chypre du Nord')
    service_times_sunday = models.CharField(_('Service du Dimanche'), max_length=100, default='Dimanche: 17h15')
    service_times_wednesday = models.CharField(_('Service du Mercredi'), max_length=100, default='Mercredi: 17h15')
    
    # Social Media
    whatsapp = models.CharField(_('WhatsApp'), max_length=100, default='905338748646')
    instagram = models.URLField(_('Instagram'), default='https://www.instagram.com/cyprusforchrist')
    youtube = models.URLField(_('YouTube'), default='https://m.youtube.com/@CyprusForChrist01')
    facebook = models.URLField(_('Facebook'), blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Informations de contact')
        verbose_name_plural = _('Informations de contact')

    def __str__(self):
        return "Informations de Contact du Site"
