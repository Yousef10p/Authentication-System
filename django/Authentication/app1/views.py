from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
import random

from django.core.mail import send_mail
import time
from django.conf import settings

# Temporary storage for OTPs
otp_storage = {}

# Step 1: 
# Check Register Data 
# If Valid ---> (send OTP)
# Else Return Error
@api_view(["POST"])
@permission_classes([AllowAny])
def register_request(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        

            
        # Generate OTP
        otp = random.randint(100000, 999999)
        otp_storage[email] = {
            "otp": otp,
            "data": serializer.validated_data,
            "expires": time.time() + settings.OTP_EXPIRATION_TIME
        }
        
        # Send OTP via email
        send_mail(
            subject='Your OTP Code',
            message=f"Hello {serializer.validated_data['username']}, your OTP is {otp}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False
        )
        
        
        
        
        print(f"OTP for {email}: {otp}")
        print(f'Otp_storage {otp_storage}')
        return Response({"message": "OTP sent to your email. Please verify.", "email": email})
    
    return Response(serializer.errors, status=400)

# Step 2: Verify OTP and create user
# Send same data in step 1 + OTP code
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    otp = int(request.data.get("otp", 0))
    
    # Check if OTP matches
    if email in otp_storage and otp_storage[email]["otp"] == otp:
        user_data = otp_storage[email]["data"]
        serializer = RegisterSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()  # create user
            otp_storage.pop(email)  # remove OTP after use
            return Response({"message": "User registered successfully"})
        return Response(serializer.errors, status=400)
    
    return Response({"error": "Invalid OTP"}, status=400)

# Protected view
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected(request):
    return Response({"message": f"Hello {request.user.username}, you are logged in!"})
