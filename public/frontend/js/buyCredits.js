document.addEventListener('DOMContentLoaded', async () => {
    const buyButton = document.getElementById("buy-credits-btn");
    const creditsInput = document.getElementById("credits-input");
    const userCreditsDisplay = document.getElementById("credits");

    buyButton.addEventListener("click", async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            alert('Devi essere loggato per accedere a questa pagina.');
            window.location.href = '/api/login';
            return;
        }
        const amount = parseInt(creditsInput.value, 10);
        if (!amount || amount <= 0) {
            alert("Inserisci un numero valido di crediti.");
            return;
        }

        try {
            const response = await fetch("/api/user/credits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });

            const data = await response.json();

            if (response.ok) {
                userCreditsDisplay.textContent = `Crediti attuali: ${data.credits}`;
                creditsInput.value = '';    // pulisce il contenuto dell'input dopo l'acquisto.
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Errore durante l\'acquisto dei crediti:", error);
            alert("Si è verificato un errore. Riprova.");
        }
    });

    // Funzione per ottenere i crediti attuali dell'utente
    async function fetchUserCredits() {
        const token = localStorage.getItem("jwtToken");

        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const userData = await response.json();
            
           if (response.ok) {
            userCreditsDisplay.textContent = `Crediti attuali: ${userData.credits}`;
           } else {
            console.error("Errore nel recupero dei crediti:", userData.error);
           }
        } catch (error) {
            console.error('Errore nel recupero dei crediti:', error);
        }
    }

    fetchUserCredits();
});