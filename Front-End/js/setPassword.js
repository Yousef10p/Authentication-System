document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('set-password-form');
    const password1 = document.getElementById('password1');
    const password2 = document.getElementById('password2');
    const passwordErr = document.querySelector('.password-err');

    const API_URL = "http://127.0.0.1:8000/password-reset/change/";
    const resetData = JSON.parse(sessionStorage.getItem("resetData"));

    function validatePassword(password) {
        return /^(?=.*\d).{8,}$/.test(password);
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
        }
    }

    password1.addEventListener('keyup', livePasswordCheck);
    password2.addEventListener('keyup', livePasswordCheck);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validatePassword(password1.value)) {
            passwordErr.textContent = 'Invalid password format';
            passwordErr.style.visibility = 'visible';
            return;
        }
        if (password1.value !== password2.value) {
            passwordErr.textContent = 'Passwords do not match';
            passwordErr.style.visibility = 'visible';
            return;
        }

        const bodyData = {
            email: resetData.email,
            code: resetData.code,
            password: password1.value
        };

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        })
        .then(res => res.json())
        .then(data => {
            window.location.href = "login.html";
            }
        )
        .catch(err => {
            console.error(err);
            passwordErr.textContent = "Server error, try again later.";
            passwordErr.style.visibility = 'visible';
        });
    });
});
