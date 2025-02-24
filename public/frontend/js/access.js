// URL base del backend
const BASE_URL = 'http://127.0.0.1:3000/api/auth';

// **REGISTRAZIONE**
async function registerUser(userData) {
    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore durante la registrazione');
        }

        const data = await response.json();
        // alert(data.message);

        // Se la registrazione ha successo, reindirizza al login
        if (data.redirect) {
            window.location.href = data.redirect;
        }
    } catch (error) {
        console.error('Errore nella registrazione:', error);
        alert(error.message);
    }
}

// **LOGIN**
async function loginUser(loginData) {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore durante il login');
        }

        const data = await response.json();

        // Salva il token nel localStorage
        localStorage.setItem('jwtToken', data.token);

        // alert(data.message);

        // Reindirizza all'homepage
        if (data.redirect) {
            window.location.href = data.redirect;
        }
    } catch (error) {
        console.error('Errore nel login:', error);
        alert(error.message);
    }
}

// **DECODIFICA JWT**
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Errore nella decodifica del token:', error);
        return null;
    }
}

// **OTTENERE I DATI DELL'UTENTE LOGGATO**
function getLoggedUser() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        return parseJwt(token);
    }
    return null;
}

// **VERIFICA AUTENTICAZIONE**
function isAuthenticated() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return false;

    const user = parseJwt(token);
    const now = Math.floor(Date.now() / 1000);
    return user && user.exp > now;
}

// **GESTIONE EVENTI FORM**
document.addEventListener('DOMContentLoaded', function () {
    // Gestione registrazione
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const userData = {
                username: document.getElementById('floatingName').value,
                password: document.getElementById('floatingPassword').value,
                email: document.getElementById('floatingInput').value,
                hero: document.getElementById('floatingHero').value,
            };
            registerUser(userData);
        });
    }

    // Gestione login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const loginData = {
                email: document.getElementById('floatingInput').value,
                password: document.getElementById('floatingPassword').value,
            };
            loginUser(loginData);
        });
    }
});