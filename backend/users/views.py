from rest_framework import generics, status, permissions, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, VerifyOTPSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import qrcode
import io
import base64

from .services import UserService

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        # Membres utilisent un serializer avec champs limités
        if self.request.user.role == 'MEMBER':
            from .serializers import MemberProfileSerializer
            return MemberProfileSerializer
        # Pasteur et Admin utilisent le serializer complet
        from .serializers import UserSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

class Enable2FAView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        # Create a new unconfirmed device (or get existing one)
        device, created = TOTPDevice.objects.get_or_create(user=user, name='default', confirmed=False)
        
        # Generate QR Code
        config_url = device.config_url
        qr = qrcode.make(config_url)
        img_buffer = io.BytesIO()
        qr.save(img_buffer, format="PNG")
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return Response({
            'qr_code': img_str,
            'secret': base64.b32encode(device.bin_key).decode('utf-8')
        })

class Verify2FAView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            otp = serializer.validated_data['otp']
            user = request.user
            
            # Find the unconfirmed device
            device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
            if not device:
                 # Check if already confirmed device exists and user wants to verify login (different flow usually, but simplifying)
                 device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            
            if device and device.verify_token(otp):
                if not device.confirmed:
                    device.confirmed = True
                    device.save()
                    user.is_2fa_enabled = True
                    user.save()
                return Response({'message': '2FA enabled/verified successfully'})
            
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreatePastorView(generics.CreateAPIView):
    """
    Vue pour créer un compte pasteur (réservée aux admins)
    Génère automatiquement un mot de passe à communiquer au pasteur
    """
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        from .serializers import CreatePastorSerializer
        return CreatePastorSerializer
    
    def create(self, request, *args, **kwargs):
        # Vérifier que l'utilisateur est admin
        if request.user.role != 'ADMIN' and not request.user.is_superuser:
            return Response(
                {'error': 'Seuls les administrateurs peuvent créer des comptes pasteur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user, password = UserService.create_pastor(serializer.validated_data)
        
        return Response({
            'username': user.username,
            'email': user.email,
            'generated_password': password,
            'message': 'Compte pasteur créé avec succès'
        }, status=status.HTTP_201_CREATED)
        
class ChangePasswordView(views.APIView):
    """
    Vue pour changer le mot de passe de l'utilisateur connecté
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        from .serializers import ChangePasswordSerializer
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["L'ancien mot de passe est incorrect."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Mot de passe modifié avec succès."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PastorListView(generics.ListAPIView):
    """
    Vue pour lister les pasteurs (accessible à tous les utilisateurs connectés)
    """
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(role='PASTOR')
    
    def get_serializer_class(self):
        from .serializers import PastorSerializer
        return PastorSerializer
class PasswordResetRequestView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "L'email est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(email=email)
        
        if users.exists():
            for user in users:
                UserService.send_password_reset_email(user)
            
            return Response({"message": "Un email de réinitialisation a été envoyé."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Si cet email est enregistré, vous recevrez un lien de réinitialisation."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Données incomplètes."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            if user.check_password(new_password):
                return Response({"error": "Vous ne pouvez pas réutiliser votre ancien mot de passe."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Le mot de passe a été réinitialisé avec succès."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Le lien de réinitialisation est invalide ou a expiré."}, status=status.HTTP_400_BAD_REQUEST)
