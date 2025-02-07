from rest_framework import generics, permissions, status
from rest_framework.response import Response
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, UserPreferences
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
import os

# Add these new views
class AccountDeletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        deletion_type = request.data.get('deletion_type')
        user = request.user

        if deletion_type == 'temporary':
            # Get deletion days from environment variable or default to 7
            deletion_days = int(os.getenv('ACCOUNT_DELETION_DAYS', 7))
            deletion_date = timezone.now() + timedelta(days=deletion_days)
            user.profile.scheduled_deletion = deletion_date
            user.profile.save()
            return Response({
                'message': f'Account scheduled for deletion in {deletion_days} days',
                'deletion_date': deletion_date
            })
        elif deletion_type == 'permanent':
            user.delete()
            return Response({'message': 'Account permanently deleted'})
        else:
            return Response({'error': 'Invalid deletion type'}, status=400)

class RestoreAccountView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to restore account

    def post(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            if user.profile.scheduled_deletion:
                user.profile.scheduled_deletion = None
                user.profile.save()
                return Response({'message': 'Account restored successfully'})
            return Response({'error': 'Account is not scheduled for deletion'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'date_joined', 'last_login_ip']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserDetailAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class RegisterAPI(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user).data,
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Get max attempts and lockout duration from environment variables
        MAX_LOGIN_ATTEMPTS = int(os.getenv('MAX_LOGIN_ATTEMPTS', 5))
        LOCKOUT_DURATION = int(os.getenv('LOCKOUT_DURATION', 2))  # in minutes
        
        try:
            user = User.objects.get(username=attrs['username'])
            
            # Check if account is locked
            if user.profile.lockout_until and user.profile.lockout_until > timezone.now():
                time_remaining = (user.profile.lockout_until - timezone.now()).seconds // 60
                raise serializers.ValidationError({
                    'detail': f'Account is locked. Try again in {time_remaining} minutes.'
                })

            # Check if password is correct
            if not user.check_password(attrs['password']):
                # Increment failed attempts
                user.profile.failed_login_attempts += 1
                
                # Check if max attempts reached
                if user.profile.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                    user.profile.lockout_until = timezone.now() + timedelta(minutes=LOCKOUT_DURATION)
                    user.profile.failed_login_attempts = 0  # Reset counter
                    user.profile.save()
                    raise serializers.ValidationError({
                        'detail': f'Too many failed attempts. Account locked for {LOCKOUT_DURATION} minutes.'
                    })
                user.profile.save()
                attempts_left = MAX_LOGIN_ATTEMPTS - user.profile.failed_login_attempts
                raise serializers.ValidationError({
                    'detail': f'Invalid credentials. {attempts_left} attempts remaining.'
                })

            # If we get here, password is correct
            data = super().validate(attrs)
            
            # Reset failed attempts on successful login
            user.profile.failed_login_attempts = 0
            user.profile.lockout_until = None
            user.profile.save()
            
            # Check for scheduled deletion
            if user.profile.scheduled_deletion:
                raise serializers.ValidationError({
                    'detail': 'Account is temporarily deleted'
                })
            
            # Get or create user preferences
            prefs, _ = UserPreferences.objects.get_or_create(user=user)
            
            # Get IP address from request
            request = self.context.get('request')
            ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
            if ',' in ip_address:
                ip_address = ip_address.split(',')[0].strip()
            
            # Save IP address to user profile
            profile = user.profile
            profile.last_login_ip = ip_address
            profile.save()
            
            # Add user data to response
            data['user'] = {
                'pk': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'profile': {
                    'last_login_ip': profile.last_login_ip
                },
                'theme_preference': prefs.theme_preference
            }
            return data
                
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'detail': 'Invalid credentials'
            })

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        return Response({
            'theme_preference': prefs.theme_preference,
            'status': 'success'
        })
    
    def patch(self, request):
        try:
            prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
            theme = request.data.get('theme_preference')
            if theme in ['light', 'dark']:
                prefs.theme_preference = theme
                prefs.save()
                return Response({
                    'theme_preference': prefs.theme_preference,
                    'status': 'success'
                })
            return Response({
                'error': 'Invalid theme value',
                'status': 'error'
            }, status=400)
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=500)
