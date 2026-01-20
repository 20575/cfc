from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

User = get_user_model()

class UserService:
    """
    Couche de service pour la logique métier liée aux utilisateurs.
    """

    @staticmethod
    def send_password_reset_email(user):
        """
        Génère un token et envoie un email de réinitialisation.
        """
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # URL du frontend
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}"
        
        # Déterminer la salutation en fonction du rôle
        greeting = f"Bonjour {user.username},"
        
        # On récupère le nom complet si possible
        full_name = f"{user.last_name} {user.first_name}".strip()
        if not full_name:
            full_name = user.username

        if user.role == 'PASTOR':
            greeting = f"Bonjour Pasteur {full_name},"
        elif user.role == 'ADMIN':
            greeting = f"Bonjour Administrateur {user.username},"
        elif user.role == 'MODERATOR':
            greeting = f"Bonjour Modérateur {user.username},"
        else:
            # Membres et autres
            greeting = f"Bonjour Frère/Sœur {full_name},"

        message = (
            f"{greeting}\n\n"
            f"Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant :\n{reset_url}\n\n"
            "Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email."
        )
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email à {user.email}: {e}")
            # On ne relance pas l'erreur pour éviter le crash (500), 
            # mais on pourrait vouloir notifier l'admin.
            return False
        return True

    @staticmethod
    @transaction.atomic
    def create_pastor(validated_data):
        """
        Crée un compte pasteur avec un mot de passe généré.
        """
        import string
        import random
        
        # Génération d'un mot de passe temporaire
        generated_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=generated_password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=User.Role.PASTOR,
            phone_number=validated_data.get('phone_number', '')
        )
        
        return user, generated_password
