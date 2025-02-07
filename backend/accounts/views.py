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
from django.contrib.auth import logout, authenticate
from django.utils import timezone
import os

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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Get or create user preferences
        prefs, _ = UserPreferences.objects.get_or_create(user=self.user)
        
        # Check if account is scheduled for deletion
        profile = self.user.profile
        if profile.scheduled_deletion:
            raise serializers.ValidationError(
                "Account is scheduled for deletion. Please restore your account to continue."
            )
        
        # Get IP address from request
        request = self.context.get('request')
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Save IP address to user profile
        profile.last_login_ip = ip_address
        profile.save()
        
        # Add user data to response
        data['user'] = {
            'pk': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
            'profile': {
                'last_login_ip': profile.last_login_ip,
                'scheduled_deletion': profile.scheduled_deletion.isoformat() if profile.scheduled_deletion else None
            },
            'theme_preference': prefs.theme_preference
        }
        return data

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

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        deletion_type = request.data.get('deletion_type')
        user = request.user

        if deletion_type == 'temporary':
            # Set deletion date instead of actually deleting
            profile = user.profile
            profile.scheduled_deletion = timezone.now() + timezone.timedelta(
                days=int(os.getenv('ACCOUNT_DELETION_DAYS', 7))
            )
            profile.save()
            # Logout the user
            logout(request)
            return Response({
                'message': 'Account scheduled for deletion',
                'restore_before': profile.scheduled_deletion
            })
        elif deletion_type == 'permanent':
            user.delete()
            return Response({'message': 'Account permanently deleted'})
        
        return Response({
            'error': 'Invalid deletion type',
            'status': 'error'
        }, status=400)

class RestoreAccountView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to try restoring

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'error': 'Username and password are required',
                'status': 'error'
            }, status=400)

        try:
            # Try to authenticate the user
            user = authenticate(username=username, password=password)
            
            if not user:
                return Response({
                    'error': 'Invalid credentials',
                    'status': 'error'
                }, status=400)

            # Check if account is actually scheduled for deletion
            profile = user.profile
            if not profile.scheduled_deletion:
                return Response({
                    'error': 'Account is not scheduled for deletion',
                    'status': 'error'
                }, status=400)

            # Restore the account
            profile.scheduled_deletion = None
            profile.save()

            return Response({
                'message': 'Account restored successfully',
                'status': 'success'
            })

        except User.DoesNotExist:
            return Response({
                'error': 'User not found',
                'status': 'error'
            }, status=404)
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=500)
