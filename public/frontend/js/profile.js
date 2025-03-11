document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Recupera il token
        const token = localStorage.getItem('jwtToken');
        if(!token) {
            window.location.href = '/api/login';
            return;
        }

        // Ottiene informazioni utente
        const response = await fetch('/api/auth/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Errore nel recupero dei dati del profilo');
        }

        const user = await response.json();
        document.getElementById('username-place').textContent = user.username;
        document.getElementById('email-place').textContent = user.email;
        document.getElementById('hero-place').textContent = user.hero;
    
        // Gestisci l'aggiornamento del profilo
        const updateForm = document.getElementById('update-profile-form');
        updateForm.addEventListener('submit', async(e) => {
            e.preventDefault();

            const updatedData = {
                username: document.getElementById('edit-username').value || user.username,
                hero: document.getElementById('edit-hero').value || user.hero,
                oldPassword: document.getElementById('old-password').value,
                newPassword: document.getElementById('new-password').value || null,
            };

            const updateResponse = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!updateResponse.ok) {
                const error = await updateResponse.json();
                alert(error.message || 'Errore durante l\'aggiornamento');
                return;
            }

            window.location.reload();
        });
    } catch (error) {
        console.error(error);
        alert('Errore durante il caricamento del profilo');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/api/landing';
});

document.getElementById('delete-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const confirmPassword = document.getElementById('delete-password').value;

    try {
        // Recupera il token
        const token = localStorage.getItem('jwtToken');
        if(!token) {
            window.location.href = '/api/login';
            return;
        }

        const response = await fetch('/api/user/profile', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ confirmPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Errore nella cancellazione del profilo.');
            return;
        }

        // log out
        localStorage.removeItem('jwtToken');
        window.location.href = '/api/login';

    } catch (error) {
        console.error(error);
        alert('Errore nella cancellazione del profilo.');
    }
});