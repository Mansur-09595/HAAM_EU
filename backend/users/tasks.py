# users/tasks.py
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

@shared_task
def send_confirmation_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/confirm-email?token={token}"
    subject = "Подтвердите вашу почту"
    message = (
        f"Здравствуйте!\n\n"
        f"Перейдите по ссылке, чтобы подтвердить Email:\n\n{link}\n\n"
        "Если вы не регистрировались — просто проигнорируйте это письмо."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
