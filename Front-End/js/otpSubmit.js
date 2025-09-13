document.addEventListener("DOMContentLoaded", () => {
    const timerEl = document.querySelector('.timer');
    const otpForm = document.querySelector('#otp-form');
    const otpInput = document.getElementById('otp_value');
    const errorEl = document.querySelector('.err');

    const REGISTER_PAGE = 'register.html';
    const LOGIN_PAGE = 'login.html';
    const SET_PASSWORD_PAGE = 'setPassword.html';

    const API_REGISTER_URL = "http://127.0.0.1:8000/register/verify-otp/";
    const API_FORGETPASSWORD_URL = "http://127.0.0.1:8000/password-reset/verify-otp/";

    const sessionData = JSON.parse(sessionStorage.getItem("data")) || {};
    const reasonToOTP = sessionStorage.getItem('reasonToOTP');

    // Update session data with OTP value
    function updateOtpData() {
    sessionData['otp'] = otpInput.value;

    if (reasonToOTP === 'password-forget') {
        sessionData['email'] = sessionStorage.getItem('resetEmail');
    }
}


    // Handle OTP form submission
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateOtpData();

        const used_API = reasonToOTP === 'password-forget' ? API_FORGETPASSWORD_URL : API_REGISTER_URL;

        fetch(used_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData)
        })
        .then(response => {
            console.log(response);
            
            if (!response.ok) throw new Error("Invalid OTP");
            return response.json();
        })
        .then((data) => {
            errorEl.style.visibility = 'hidden';

            if (used_API === API_FORGETPASSWORD_URL) {
                resetData = {
                    "email": sessionData['email'],
                    'code': data.code
                }
                sessionStorage.setItem("resetData", JSON.stringify(resetData));
                window.location.href = SET_PASSWORD_PAGE; // Go to reset password
            } else {
                window.location.href = LOGIN_PAGE; // Go back to login after register OTP
            }
        })
        .catch(() => {
            errorEl.textContent = 'OTP is invalid';
            errorEl.style.visibility = 'visible';
        });
    });

    // Start 5-minute countdown timer
    function startTimer(durationSeconds, onTick, onComplete) {
        let remaining = durationSeconds;
        const interval = setInterval(() => {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;

            if (onTick) onTick(minutes, seconds);

            remaining--;

            if (remaining < 0) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1000);
    }

    startTimer(
        5 * 60, // 5 minutes
        (min, sec) => { timerEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`; },
        () => { window.location.replace(REGISTER_PAGE); }
    );
});
