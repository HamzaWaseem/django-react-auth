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

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'date_joined']

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
        # Get user profile
        profile = self.user.profile
        # Update last login IP
        profile.last_login_ip = self.context['request'].META.get('REMOTE_ADDR')
        profile.save()
        # Add user data to response
        data['user'] = {
            'pk': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
            'last_login_ip': profile.last_login_ip,
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
