document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Devi effettuare il login!');
        window.location.href = '/login.html';
        return;
    }

    const creditsElement = document.getElementById('credits');
    const buyButton = document.getElementById('buy-pack');
    const packContainer = document.getElementById('pack-container');

    // Funzione per aggiornare i crediti dell'utente
    async function updateCredits() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userData = await response.json();
            if (userData.credits !== undefined) {
                creditsElement.textContent = `Crediti: ${userData.credits}`;
            }
        } catch (error) {
            console.error('Errore nel recuper dei crediti:', error);
        }
    }

    // Funzione per acquistare un pacchetto
    async function BuyPack() {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/packs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error);
                return;
            }

            const { cards, updatedCredits } = await response.json();

            // Aggiorna i crediti sul frontend
            creditsElement.textContent = `Crediti: ${updatedCredits}`;

            // Mostra le figurine coperte
            packContainer.innerHTML = '';   // Pulisce il contenitore
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.dataset.image = card.image;
                cardElement.dataset.name = card.name;
                cardElement.textContent = '?';

                // Aggiunge l'evento click per scoprire la carta
                cardElement.addEventListener('click', function () {
                    this.style.backGroundImage = `url(${this.dataset.image})`;
                    this.textContent = this.dataset.name;
                });

                packContainer.appendChild(cardElement);
            });

        } catch (error) {
            console.error('Errore durante l\'acquisto del pacchetto:', error);
        }
    }

    // Aggiunge l'evento di click al bottone
    buyButton.addEventListener('click', BuyPack);

    // Aggiorna i crediti all'inizio
    updateCredits();
});