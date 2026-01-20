import os
import django
from django.core.mail import send_mail
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cyprus_api.settings')
django.setup()

print("Testing email configuration...")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")

try:
    send_mail(
        'Test Subject',
        'This is a test email.',
        settings.DEFAULT_FROM_EMAIL,
        ['vincentlufutu01@gmail.com'],
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"FAILED to send email: {e}")
