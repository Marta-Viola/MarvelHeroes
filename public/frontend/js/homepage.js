document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Recupera il token dalla memoria locale
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            window.location.href = '/api/login';
            return;
        }

        // Decodifica e usa il token per recuperare i dati utente
        const response = await fetch('http://127.0.0.1:3000/api/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Errore durante il recupero dei dati utente');
        }

        const userData = await response.json();
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Ciao, ${userData.username}`;
    } catch (error) {
        console.error(error);
        alert('Errore durante il recupero delle informazioni dell\'utente. Reindirizzamento al login.');
        window.location.href = '/api/login';
    }
});
