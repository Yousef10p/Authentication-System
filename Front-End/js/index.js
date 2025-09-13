document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const username = localStorage.getItem('username');
    const welcomeText = document.getElementById('welcome-text');
    const logoutBtn = document.getElementById('logout-btn');

    // Redirect to login if no token
    if (!accessToken) {
        console.log('redirect 401');
        window.location.href = "login.html";
    } else {
        console.log('welcome there');
        // Display welcome message
        welcomeText.textContent = `Welcome ${username} 🎉`;
    }

    // Logout button functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username'); // remove username as well
        window.location.href = "login.html";
    });
});
