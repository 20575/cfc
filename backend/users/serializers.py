from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_2fa_enabled', 'profile_picture', 'bio', 'member_id', 'created_at', 'birth_date', 'address')
        read_only_fields = ('role', 'is_2fa_enabled', 'member_id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'birth_date', 'address')
        extra_kwargs = {
            'username': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value

    def validate(self, attrs):
        if not attrs.get('username'):
            attrs['username'] = attrs.get('email')
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            birth_date=validated_data.get('birth_date'),
            address=validated_data.get('address', ''),
            role=User.Role.MEMBER  # Default role for new signups
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        # Allow login with email
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        if username and '@' in username:
            try:
                user = User.objects.get(email=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                # If email not found, let the parent class handle the error (it will fail authentication)
                pass
        
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class VerifyOTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6, min_length=6)


class MemberProfileSerializer(serializers.ModelSerializer):
    """Serializer pour les membres - champs modifiables limités"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 
                  'phone_number', 'bio', 'member_id', 'birth_date', 'address', 'created_at', 'role')
        read_only_fields = ('id', 'username', 'email', 'phone_number', 'bio', 'member_id', 
                           'birth_date', 'address', 'created_at', 'role')
    
    # Les membres peuvent modifier uniquement: first_name, last_name, profile_picture


class CreatePastorSerializer(serializers.ModelSerializer):
    """Serializer pour créer un compte pasteur (admin uniquement)"""
    generated_password = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'generated_password')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }
    
    def get_generated_password(self, obj):
        return getattr(obj, 'generated_password', None)
    
    def create(self, validated_data):
        
        # Générer un mot de passe aléatoire sécurisé (mélange de lettres et chiffres, évite les symboles ambigus)
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for _ in range(12))
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=User.Role.PASTOR,
            is_staff=True  # Les pasteurs ont accès à l'admin Django si nécessaire
        )
        
        # Stocker le mot de passe pour le retourner (il ne sera pas sauvegardé en clair)
        user.generated_password = password
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "Le nouveau mot de passe doit être différent de l'ancien."})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Les nouveaux mots de passe ne correspondent pas."})
        return attrs

class PastorSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les informations publiques des pasteurs"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'full_name', 'profile_picture', 'bio')
