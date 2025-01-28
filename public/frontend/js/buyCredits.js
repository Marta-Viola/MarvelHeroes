document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    console.log('Token:', token);

    if (!token) {
        alert('Devi essere loggato per accedere a questa pagina.');
        window.location.href = '/api/login';
        return;
    }

    try {
        //richiesta per recuperare le info dell'utente
        const response = await fetch('http://127.0.0.1:3000/api/user/profile', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Errore durante il recupero delle informazione dell\'utente.');
        }

        const userData = await response.json();
        console.log('Dati utente:', userData);

        //mostra i crediti dell'utente sulla pagina
        const creditsElement = document.getElementById('credits');
        creditsElement.textContent = `Crediti attuali: ${userData.credits}`;
    } catch (error) {
        console.error('Errore durante l\'acquisto dei crediti:', error);
        alert('Errore durante il recupero delle informazioni dell\'utente. Reindirizzamento al login');
        window.location.href = '/api/login';
    }
});