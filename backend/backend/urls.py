from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import (
    UserDetailAPI, 
    GoogleLogin, 
    CustomTokenObtainPairView, 
    UserPreferencesView,
    AccountDeletionView,    # Add this
    RestoreAccountView      # Add this
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Your API",
        default_version='v1',
        description="Your API description",
        terms_of_service="https://www.yourapp.com/terms/",
        contact=openapi.Contact(email="contact@yourapp.com"),
        license=openapi.License(name="Your License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Swagger documentation URLs
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Auth URLs
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),  # Handles login, logout, user details
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # Handles registration
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # JWT Token URLs
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Details URL
    path('api/user/', UserDetailAPI.as_view(), name='user-detail'),
    path('api/user/preferences/', UserPreferencesView.as_view(), name='user-preferences'),

    # Add api/ prefix to maintain consistency with other endpoints
    path('api/user/delete-account/', AccountDeletionView.as_view(), name='delete-account'),
    path('api/user/restore-account/', RestoreAccountView.as_view(), name='restore-account'),
]
