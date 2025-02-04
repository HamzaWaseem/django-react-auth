from rest_framework import generics, permissions
from rest_framework.response import Response
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from rest_framework import serializers
from django.conf import settings
from rest_framework.views import APIView
from django.shortcuts import redirect
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework import status
from django.http import JsonResponse
import json
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class UserDetailAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class GoogleLoginURLView(APIView):
    def get(self, request):
        try:
            client_secrets_file = os.path.join(
                settings.BASE_DIR, 
                'credentials', 
                'client_secrets.json'
            )
            
            # Print the contents of client_secrets.json for verification
            with open(client_secrets_file, 'r') as f:
                config = json.load(f)
                print("Client Secrets Configuration:")
                print(f"Redirect URIs: {config['web']['redirect_uris']}")
                print(f"JavaScript Origins: {config['web'].get('javascript_origins', [])}")
            
            # Define the exact redirect URI
            redirect_uri = 'http://localhost:8000/api/auth/google/callback/'
            
            flow = Flow.from_client_secrets_file(
                client_secrets_file,
                scopes=[
                    'openid',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ],
                redirect_uri=redirect_uri
            )
            
            # Print verification information
            print(f"Using redirect URI: {redirect_uri}")
            print(f"Client ID from flow: {flow.client_config['client_id']}")
            print(f"Configured redirect URIs: {flow.client_config.get('redirect_uris', [])}")
            
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            
            # Print the full authorization URL
            print(f"Authorization URL: {authorization_url}")
            
            request.session['google_oauth_state'] = state
            
            return Response({'authorization_url': authorization_url})
            
        except Exception as e:
            print(f"Error in GoogleLoginURLView: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    
    def post(self, request, *args, **kwargs):
        try:
            access_token = request.data.get('access_token')
            
            # Use the access token to get user info from Google
            credentials = Credentials(token=access_token)
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            
            # Create or get the user
            email = user_info.get('email')
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': user_info.get('name'),
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                }
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class GoogleCallbackView(APIView):
    def get(self, request):
        try:
            code = request.GET.get('code')
            state = request.GET.get('state')
            
            # Print debug information
            print(f"Received code: {code[:10]}... and state: {state}")
            
            stored_state = request.session.pop('google_oauth_state', None)
            if stored_state != state:
                print(f"State mismatch. Stored: {stored_state}, Received: {state}")
                return redirect('http://localhost:3000/auth/error/?error=invalid_state')

            client_secrets_file = os.path.join(settings.BASE_DIR, 'credentials', 'client_secrets.json')
            flow = Flow.from_client_secrets_file(
                client_secrets_file,
                scopes=[
                    'openid',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ],
                redirect_uri='http://localhost:8000/api/auth/google/callback/'
            )
            
            try:
                # Exchange code for credentials
                flow.fetch_token(code=code)
                credentials = flow.credentials
                
                # Get user info from Google
                id_info = id_token.verify_oauth2_token(
                    credentials.id_token,
                    requests.Request(),
                    flow.client_config['client_id']
                )
                
                print(f"Received user info: {json.dumps(id_info, indent=2)}")
                
                # Create or get user
                email = id_info['email']
                name = id_info.get('name', email.split('@')[0])
                
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': name.replace(' ', '_').lower(),
                        'first_name': id_info.get('given_name', ''),
                        'last_name': id_info.get('family_name', '')
                    }
                )
                
                if created:
                    print(f"Created new user: {user.username}")
                else:
                    print(f"Found existing user: {user.username}")
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                tokens = {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
                
                # Encode tokens for URL
                from urllib.parse import urlencode
                params = urlencode(tokens)
                
                # Redirect to frontend with tokens
                redirect_url = f'http://localhost:3000/auth/success/?{params}'
                print(f"Redirecting to: {redirect_url}")
                
                return redirect(redirect_url)
                
            except Exception as e:
                print(f"Error during token exchange or user creation: {str(e)}")
                return redirect(f'http://localhost:3000/auth/error/?error={str(e)}')
                
        except Exception as e:
            print(f"Error in GoogleCallbackView: {str(e)}")
            return redirect(f'http://localhost:3000/auth/error/?error={str(e)}')

class VerifyGoogleConfig(APIView):
    def get(self, request):
        client_secrets_file = os.path.join(
            settings.BASE_DIR, 
            'credentials', 
            'client_secrets.json'
        )
        
        try:
            with open(client_secrets_file, 'r') as f:
                config = json.load(f)
            
            # Remove sensitive information
            safe_config = {
                'redirect_uris': config['web']['redirect_uris'],
                'javascript_origins': config['web'].get('javascript_origins', [])
            }
            
            return JsonResponse({
                'config_exists': True,
                'config_path': client_secrets_file,
                'safe_config': safe_config
            })
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'config_exists': False,
                'config_path': client_secrets_file
            })
