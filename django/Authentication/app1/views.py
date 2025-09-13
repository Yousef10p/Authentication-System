from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer
import random
import time

# Temporary in-memory storage for OTPs and password reset codes
otp_storage = {}
password_reset_code = None


# ---------------------------
# Utility Functions
# ---------------------------
def generate_otp():
    return random.randint(100000, 999999)


def send_otp_email(email: str, otp: int, username: str = None):
    subject = 'Your OTP Code'
    message = f"Hello {username if username else ''}, your OTP is {otp}"
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email], fail_silently=False)


def store_otp(email: str, data: dict = None):
    otp_storage[email] = {
        "otp": generate_otp(),
        "data": data,
        "expires": time.time() + settings.OTP_EXPIRATION_TIME
    }
    return otp_storage[email]["otp"]


def verify_stored_otp(email: str, otp: int):
    if email in otp_storage and otp_storage[email]["otp"] == otp:
        return True
    return False


# ---------------------------
# Registration Flow
# ---------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_request(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']

        otp = store_otp(email, serializer.validated_data)
        send_otp_email(email, otp, serializer.validated_data['username'])

        print(f"OTP for {email}: {otp}")
        print(f"OTP storage: {otp_storage}")

        return Response({"message": "OTP sent to your email. Please verify."})

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_registration_otp(request):
    email = request.data.get("email")
    otp = int(request.data.get("otp", 0))

    if verify_stored_otp(email, otp):
        user_data = otp_storage[email]["data"]
        serializer = RegisterSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            otp_storage.pop(email)
            return Response({"message": "User registered successfully"})
        return Response(serializer.errors, status=400)

    return Response({"error": "Invalid OTP"}, status=400)


# ---------------------------
# Password Reset Flow
# ---------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def generate_password_reset_otp(request):
    email = request.data.get("email")
    otp = store_otp(email)
    send_otp_email(email, otp)
    return Response({"message": "OTP sent to your email. Please verify."})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_password_reset_otp(request):
    global password_reset_code
    email = request.data.get("email")
    otp = int(request.data.get("otp", 0))

    if verify_stored_otp(email, otp):
        otp_storage.pop(email)
        password_reset_code = generate_otp()
        return Response({"message": "OTP verified successfully", "code": password_reset_code})

    return Response({"message": "OTP is incorrect"}, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def change_password(request):
    global password_reset_code

    email = request.data.get("email")
    new_password = request.data.get("password")
    code = int(request.data.get("code"))

    if password_reset_code != code:
        return Response({"error": "Invalid code"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=404)

    user.password = make_password(new_password)
    user.save()
    password_reset_code = None

    return Response({"message": "Password reset successfully"}, status=200)


# ---------------------------
# Protected View Example
# ---------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": f"Hello {request.user.username}, you are logged in!"})
