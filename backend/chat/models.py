from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from appointments.models import Appointment

class Message(models.Model):
    """Message entre un pasteur/admin et un membre, potentiellement lié à un rendez-vous ou un don"""
    
    class MessageType(models.TextChoices):
        GENERAL = 'GENERAL', _('Général')
        APPOINTMENT = 'APPOINTMENT', _('Rendez-vous')
        DONATION_ISSUE = 'DONATION_ISSUE', _('Problème de Don')
        SUPPORT = 'SUPPORT', _('Support')

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    message_type = models.CharField(
        _('Type de message'),
        max_length=20,
        choices=MessageType.choices,
        default=MessageType.GENERAL
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='messages',
        null=True,
        blank=True
    )
    donation = models.ForeignKey(
        'donations.Donation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='support_messages'
    )
    content = models.TextField(_('Contenu'))
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.get_message_type_display()}] De {self.sender.username} à {self.receiver.username}"
