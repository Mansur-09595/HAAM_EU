import uuid
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    email_confirm_token = models.CharField(max_length=64, blank=True, null=True)
    email_confirm_sent_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    # == Email confirmation ==
    def generate_email_token(self):
        token = uuid.uuid4().hex
        self.email_confirm_token = token
        self.email_confirm_sent_at = timezone.now()
        self.save(update_fields=['email_confirm_token', 'email_confirm_sent_at'])
        return token
    
    def __str__(self):
        return self.email
    

class Subscription(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
