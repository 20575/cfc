"""
Django settings for Cyprus For Christ API.
"""

from pathlib import Path
from decouple import config
from datetime import timedelta
import os

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,cyprusforchrist-production.up.railway.app').split(',')

CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost:8000,http://127.0.0.1:8000,https://cyprusforchrist-production.up.railway.app').split(',')


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'drf_yasg',
    
    # Cyprus For Christ apps
    'users.apps.UsersConfig',
    'sermons.apps.SermonsConfig',
    'prayers.apps.PrayersConfig',
    'ai_assistant.apps.AiAssistantConfig',
    'rhema.apps.RhemaConfig',
    'donations.apps.DonationsConfig',
    'contact.apps.ContactConfig',
    'about.apps.AboutConfig',
    'dashboard.apps.DashboardConfig',
    'appointments.apps.AppointmentsConfig',
    'chat',
    'announcements.apps.AnnouncementsConfig',
    'lives.apps.LivesConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # i18n support
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',  # 2FA support
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://127.0.0.1:5173').split(',')

ROOT_URLCONF = 'cyprus_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cyprus_api.wsgi.application'

# Database Configuration - Robust Fallback Logic
import dj_database_url
import os
import sys

# DEBUG: Print environment variables to debug connection issue (Masking passwords)
print("DEBUG: Checking Database Configuration...")
env_keys = [k for k in os.environ.keys()]
print(f"DEBUG: Available Env Keys: {env_keys}")
print(f"DEBUG: DATABASE_URL present: {'DATABASE_URL' in os.environ}")
print(f"DEBUG: MYSQLHOST present: {'MYSQLHOST' in os.environ}")
print(f"DEBUG: MYSQL_URL present: {'MYSQL_URL' in os.environ}")

DATABASES = {}

if os.environ.get('DATABASE_URL'):
    print("DEBUG: Configuration Method -> DATABASE_URL")
    DATABASES['default'] = dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
elif os.environ.get('MYSQL_URL'):
    print("DEBUG: Configuration Method -> MYSQL_URL")
    DATABASES['default'] = dj_database_url.config(
        default=os.environ.get('MYSQL_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
elif os.environ.get('MYSQLHOST'):
    print("DEBUG: Configuration Method -> MYSQLHOST Env Vars")
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('MYSQLDATABASE', os.environ.get('DB_NAME', 'cyprus_for_christ')),
        'USER': os.environ.get('MYSQLUSER', os.environ.get('DB_USER', 'root')),
        'PASSWORD': os.environ.get('MYSQLPASSWORD', os.environ.get('DB_PASSWORD', '')),
        'HOST': os.environ.get('MYSQLHOST'),
        'PORT': os.environ.get('MYSQLPORT', os.environ.get('DB_PORT', '3306')),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }
else:
    print("DEBUG: Configuration Method -> Localhost/Default (Fallback)")
    # Default to localhost variables if nothing else is found
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='cyprus_for_christ'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }

# Ensure PyMySQL is used if it's a mysql backend
if DATABASES['default']['ENGINE'] == 'django.db.backends.mysql':
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
        print("DEBUG: PyMySQL installed as MySQLdb")
    except ImportError:
        print("DEBUG: PyMySQL not installed")

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fr'  # Default: French
LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
]
LOCALE_PATHS = [BASE_DIR / 'locale']

TIME_ZONE = 'Europe/Nicosia'  # Cyprus timezone
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'cyprus_api.exceptions.custom_exception_handler',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

CORS_ALLOW_CREDENTIALS = True

# AI Configuration
# OpenAI (Legacy/Option)
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-3.5-turbo')

# Google Gemini (Active) - Using REST API
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
GEMINI_MODEL = config('GEMINI_MODEL', default='models/text-bison-001')

# PayPal Configuration
PAYPAL_MODE = config('PAYPAL_MODE', default='sandbox')
PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_CURRENCY = config('PAYPAL_CURRENCY', default='EUR')

# WhatsApp Configuration
WHATSAPP_NUMBER = config('WHATSAPP_NUMBER', default='')
WHATSAPP_DEFAULT_MESSAGE = config(
    'WHATSAPP_DEFAULT_MESSAGE',
    default='Bonjour, je vous contacte depuis Cyprus For Christ'
)

# Social Media Configuration
INSTAGRAM_URL = config('INSTAGRAM_URL', default='https://www.instagram.com/cyprusforchrist?igsh=MjByMG15YmFiNG5i')
YOUTUBE_URL = config('YOUTUBE_URL', default='https://youtube.com/@CyprusForChrist?si=eTlfmDFDx3qdx9Y1')

# Email Configuration
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default='Cyprus For Christ <noreply@cyprusforchrist.org>'
)

# File Upload Configuration
MAX_PDF_SIZE_MB = config('MAX_PDF_SIZE_MB', default=50, cast=int)
MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
ALLOWED_PDF_EXTENSIONS = config('ALLOWED_PDF_EXTENSIONS', default='pdf').split(',')
ALLOWED_IMAGE_EXTENSIONS = config(
    'ALLOWED_IMAGE_EXTENSIONS',
    default='jpg,jpeg,png,webp'
).split(',')

# Church Information (for receipts and emails)
CHURCH_INFO = {
    'name': config('CHURCH_NAME', default='Cyprus For Christ'),
    'address': config('CHURCH_ADDRESS', default='Adresse de l\'église, Chypre'),
    'email': config('CHURCH_EMAIL', default='contact@cyprusforchrist.org'),
    'phone': config('CHURCH_PHONE', default=''),
    'website': config('CHURCH_WEBSITE', default='https://www.cyprusforchrist.org'),
}

# Security Settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'ai_assistant': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
# Logs directory created above
# PayPal Configuration Updated (Attempt 4 - Events Archive Logic Added)

