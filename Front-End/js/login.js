document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.login-container');
    const forgotPassword = container.querySelector('.forgot-password-text');
    const form = document.querySelector('#login-form');
    const API_URL = "http://127.0.0.1:8000/login/";
    const FORGET_URL = "http://127.0.0.1:8000/password-reset/otp/"; // generate OTP
    const loginError = document.querySelector('#login-error');

    // Forgot password logic
    forgotPassword.addEventListener('click', () => {
        const loginForm = container.querySelector('#login-form');
        loginForm.style.display = 'none';

        // Create Reset Email Form
        const emailForm = document.createElement('form');
        emailForm.id = 'email-reset-form';
        emailForm.innerHTML = `
            <h1>Reset Password</h1>
            <p class="login-error" id="email-error">Please enter a valid email</p>
            <div class="login-field">
                <input type="email" placeholder="Enter your email" required>
            </div>
            <button class="login-button" type="submit">Submit</button>
        `;
        container.appendChild(emailForm);

        const emailInput = emailForm.querySelector('input');
        const emailError = emailForm.querySelector('#email-error');
        emailError.style.visibility = 'hidden';

        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!emailInput.value || !emailInput.value.includes('@')) {
                emailError.style.visibility = 'visible';
                return;
            }

            try {
                // Call backend to generate OTP
                const response = await fetch(FORGET_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: emailInput.value }),
                });

                if (!response.ok) {
                    emailError.textContent = "Email not found. Try again.";
                    emailError.style.visibility = 'visible';
                    return;
                }

                // Save email & reason for OTP flow
                sessionStorage.setItem('reasonToOTP', 'password-forget');
                sessionStorage.setItem('resetEmail', emailInput.value);

                // Redirect to OTP page
                window.location.replace('otpSubmit.html');

            } catch (err) {
                console.error("OTP request error:", err);
                emailError.textContent = "Something went wrong. Try again.";
                emailError.style.visibility = 'visible';
            }
        });
    });

    // Login form logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = form.querySelector('input[type="text"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();

        loginError.style.visibility = 'hidden'; // hide old error

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                loginError.textContent = "Either Username or Password is wrong";
                loginError.style.visibility = 'visible';
                return;
            }

            const data = await response.json();
            // Store tokens in localStorage
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("username",username)
            // Redirect to protected page
            window.location.replace("index.html");

        } catch (error) {
            console.error("Login error:", error);
            loginError.textContent = "Something went wrong. Try again.";
            loginError.style.visibility = 'visible';
        }
    });
});
