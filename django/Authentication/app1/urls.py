from django.urls import path
from .views import (
    register_request,
    verify_registration_otp,
    protected_view,
    generate_password_reset_otp,
    verify_password_reset_otp,
    change_password
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Registration
    path("register/", register_request, name="register"),
    path("register/verify-otp/", verify_registration_otp, name="verify_registration_otp"),

    # Authentication
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),

    # Protected route
    path("protected/", protected_view, name="protected"),

    # Password reset
    path("password-reset/otp/", generate_password_reset_otp, name="generate_password_reset_otp"),
    path("password-reset/verify-otp/", verify_password_reset_otp, name="verify_password_reset_otp"),
    path("password-reset/change/", change_password, name="change_password"),
]
