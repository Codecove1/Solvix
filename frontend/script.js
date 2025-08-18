document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let authToken = null;

    // --- DOM Elements ---
    const authContainer = document.getElementById('auth-container');
    const mainAppContainer = document.getElementById('main-app-container');

    // Auth forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');

    // Main app
    const welcomeMessage = document.getElementById('welcome-message');
    const userStatusText = document.getElementById('user-status-text');
    const superAiRadio = document.getElementById('super-ai');
    const superAiLabel = document.getElementById('super-ai-label');
    const upgradeButton = document.getElementById('upgrade-button');
    const logoutButton = document.getElementById('logout-button');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');

    // --- Auth Logic ---

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    registerButton.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        if (!username || !password) {
            alert('Please enter a username and password.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                showLoginLink.click();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`An error occurred: ${error}`);
        }
    });

    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            alert('Please enter a username and password.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                loginUser(data.token);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`An error occurred: ${error}`);
        }
    });

    logoutButton.addEventListener('click', () => {
        authToken = null;
        authContainer.style.display = 'block';
        mainAppContainer.style.display = 'none';
        chatMessages.innerHTML = '';
    });

    async function loginUser(token) {
        authToken = token;
        authContainer.style.display = 'none';
        mainAppContainer.style.display = 'block';
        await updateUserStatusUI();
    }

    async function updateUserStatusUI() {
        if (!authToken) return;
        try {
            const response = await fetch('http://localhost:5000/user_status', {
                headers: { 'Authorization': authToken }
            });
            const data = await response.json();
            if (response.ok) {
                welcomeMessage.textContent = `Welcome, ${data.username}!`;
                if (data.is_premium) {
                    userStatusText.textContent = 'Status: Premium User | Unlimited questions';
                    superAiRadio.disabled = false;
                    superAiLabel.textContent = 'Super AI';
                    upgradeButton.style.display = 'none';
                } else {
                    const questionsLeft = 5 - data.daily_question_count;
                    userStatusText.textContent = `Status: Free User | Questions left: ${questionsLeft}`;
                    superAiRadio.disabled = true;
                    superAiLabel.textContent = 'Super AI (Premium)';
                    upgradeButton.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    }

    // --- Chat Logic ---

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        const selectedModel = document.querySelector('input[name="model"]:checked').value;
        appendMessage(message, 'user-message');
        messageInput.value = '';

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ message, model: selectedModel }),
            });
            const data = await response.json();
            appendMessage(data.response, 'ai-message');
            // After a chat message, update the question count in the UI
            await updateUserStatusUI();
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Oops! Something went wrong.', 'ai-message');
        }
    });

    function appendMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- Premium Upgrade Logic ---
    upgradeButton.addEventListener('click', async () => {
        if (!authToken) return;
        if (!confirm('Are you sure you want to upgrade to premium for $25 (simulated)?')) return;

        try {
            const response = await fetch('http://localhost:5000/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                await updateUserStatusUI();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`An error occurred: ${error}`);
        }
    });
});
