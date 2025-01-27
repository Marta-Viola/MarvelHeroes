document.addEventListener('DOMContentLoaded', () => {
    const creditsInput = document.getElementById('credits-input');
    const buyCreditsBtn = document.getElementById('but-credits-btn');
    const messageContainer = document.getElementById('message-container');

    //Recupera il token di autenticazione
    const token = localStorage.getItem('token');

    if (!token) {
        messageContainer.innerHTML = '<p class="text-danger">Accesso non autorizzato. Effettua il login.</p>';
        return;
    }

    buyCreditsBtn.addEventListener('click', async () => {
        const creditsToAdd = parseInt(creditsInput.value);

        if (!creditsToAdd || creditsToAdd <= 0) {
            messageContainer.innerHTML = '<p class="text-danger">Inserisci un numero valido di crediti.</p>';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:3000/api/user/addCredits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ creditsToAdd }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante l\'acquisto dei crediti.');
            }

            messageContainer.innerHTML = `<p class="text-success">Crediti aggiunti con successo! Saldo attuale: ${data.newBalance} crediti.</p>`;
            creditsInput.value = ''; // Resetta l'input
        } catch (error) {
            console.error(error);
            messageContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    })
})
//NOT FINISHED!!! ARRIVATA AL PUNTO COLLEGAMENTO DELLO SCRIPT ALLA PAGINA