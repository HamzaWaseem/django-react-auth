from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_ip = models.CharField(max_length=45, blank=True, null=True)
    scheduled_deletion = models.DateTimeField(null=True, blank=True)  # Add this field
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()



class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    theme_preference = models.CharField(max_length=10, default='light')

    class Meta:
        verbose_name_plural = 'User Preferences'