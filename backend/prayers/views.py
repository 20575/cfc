from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import PrayerRequest
from .serializers import PrayerRequestSerializer
from users.permissions import IsPastorOrAdmin

class PrayerRequestViewSet(viewsets.ModelViewSet):
    queryset = PrayerRequest.objects.all()
    serializer_class = PrayerRequestSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action == 'create':
            # Tout le monde (y compris les invités) peut créer des requêtes
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            # Authentifié pour voir (filtré par get_queryset)
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Seuls pasteur et admin peuvent modifier/supprimer
            return [IsPastorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # L'utilisateur est associé s'il est connecté, sinon c'est une requête "invité"
        if self.request.user.is_authenticated:
            prayer = serializer.save(user=self.request.user)
        else:
            prayer = serializer.save(user=None)
        
        # Envoyer email de confirmation si un email est fourni
        email = prayer.email or (prayer.user.email if prayer.user else None)
        
        if email:
            self._send_confirmation_email(prayer, email)
    
    def _send_confirmation_email(self, prayer, recipient_email):
        """Envoie un email de confirmation pour la requête de prière"""
        from django.core.mail import send_mail
        from django.template.loader import render_to_string
        
        subject = "🙏 Votre requête de prière a été reçue - Cyprus For Christ"
        
        name = prayer.full_name or (prayer.user.get_full_name() if prayer.user else "Bien-aimé(e)")
        
        message = f"""
Bonjour {name},

Nous avons bien reçu votre requête de prière concernant : "{prayer.title}"

🙏 L'équipe d'intercession de Cyprus For Christ prend votre demande très au sérieux. 
Soyez assuré(e) que nous portons votre situation dans nos prières.

"Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu 
par des prières et des supplications, avec des actions de grâces." 
- Philippiens 4:6

Notre équipe d'intercession prie régulièrement pour toutes les requêtes reçues. 
Continuez à garder la foi et faites confiance à Dieu pour votre situation.

Que la paix de Dieu soit avec vous.

---
Cyprus For Christ
Équipe d'Intercession
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=None,  # Utilise DEFAULT_FROM_EMAIL
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception as e:
            # Logger l'erreur mais ne pas faire échouer la requête
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de l'envoi de l'email de confirmation de prière: {e}")


    def get_queryset(self):
        user = self.request.user
        
        # Pasteur et Admin voient toutes les prières
        if user.role in ['PASTOR', 'ADMIN'] or user.is_superuser:
            return PrayerRequest.objects.all()
        # Membres voient uniquement leurs propres prières
        else:
            return PrayerRequest.objects.filter(user=user)
