from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import UserDetailAPI, GoogleLogin

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/google/", GoogleLogin.as_view(), name="google_login"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user/", UserDetailAPI.as_view(), name="user-detail"),
]
