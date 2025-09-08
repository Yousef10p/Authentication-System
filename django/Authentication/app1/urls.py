from django.urls import path
from .views import register_request, verify_otp, protected
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", register_request, name="register"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("protected/", protected, name="protected"),
]