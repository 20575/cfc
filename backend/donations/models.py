from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Donation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('En attente')
        COMPLETED = 'COMPLETED', _('Complété')
        FAILED = 'FAILED', _('Échoué')
        CANCELLED = 'CANCELLED', _('Annulé')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations'
    )
    
    amount = models.DecimalField(_('Montant'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('Devise'), max_length=3, default='EUR')
    
    paypal_payment_id = models.CharField(_('ID Paiement PayPal'), max_length=100, unique=True)
    paypal_payer_id = models.CharField(_('ID Payeur PayPal'), max_length=100, blank=True, null=True)
    
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    project = models.CharField(_('Projet'), max_length=200, blank=True, null=True)
    is_anonymous = models.BooleanField(_('Don anonyme'), default=False)
    is_archived = models.BooleanField(_('Archivé (supprimé logiquement)'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Don')
        verbose_name_plural = _('Dons')
        ordering = ['-created_at']

    def __str__(self):
        name = self.user.username if self.user and not self.is_anonymous else "Anonyme"
        return f"Don de {self.amount} {self.currency} par {name}"
