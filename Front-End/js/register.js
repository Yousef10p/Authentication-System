document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('register-form');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password1 = document.getElementById('password1');
    const password2 = document.getElementById('password2');

    const usernameErr = document.querySelector('.username-err');
    const emailErr = document.querySelector('.email-err');
    const passwordErr = document.querySelector('.password-err');

    const API_URL = "http://127.0.0.1:8000/register/";
    const OTP_PAGE = "otpSubmit.html";
    let userData = null;

    function validatePassword(password) {
        return /^(?=.*\d).{8,}$/.test(password);
    }

    function updateUserData() {
        if (!username.value || !email.value || !password1.value || !password2.value) return false;
        if (password1.value !== password2.value) return false;
        if (!validatePassword(password1.value)) return false;

        userData = { username: username.value, email: email.value, password: password1.value };
        return true;
    }

    function livePasswordCheck() {
        if (!validatePassword(password1.value)) {
            passwordErr.textContent = 'Password must be at least 8 chars and contain 1 number';
            passwordErr.style.visibility = 'visible';
        } else if (password1.value !== password2.value) {
            passwordErr.textContent = 'Passwords do not match';
            passwordErr.style.visibility = 'visible';
        } else {
            passwordErr.style.visibility = 'hidden';
            if (userData) userData.password = password1.value;
        }
    }

    password1.addEventListener('keyup', livePasswordCheck);
    password2.addEventListener('keyup', livePasswordCheck);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sessionStorage.setItem('reasonToOTP', 'register');

        if (!updateUserData()) return;

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.username || result.email) {
                usernameErr.textContent = result.username ? 'Username in use' : '';
                usernameErr.style.visibility = result.username ? 'visible' : 'hidden';
                emailErr.textContent = result.email ? 'Email in use' : '';
                emailErr.style.visibility = result.email ? 'visible' : 'hidden';
                return;
            }

            usernameErr.style.visibility = 'hidden';
            emailErr.style.visibility = 'hidden';
            sessionStorage.setItem("data", JSON.stringify(userData));
            window.location.replace(OTP_PAGE);
        })
        .catch(console.error);
    });
});
