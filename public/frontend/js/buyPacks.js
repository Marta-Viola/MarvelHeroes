document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Devi effettuare il login!');
        window.location.href = '/login.html';
        return;
    }
    // elementi necessari alla pagina
    const creditsElement = document.getElementById('credits');
    const buyButton = document.getElementById('buy-pack');
    const packContainer = document.getElementById('pack-container');

    // funzione per mostrare le figurine comprate
    function renderFigurineComprate(figurine) {
        packContainer.innerHTML = '';

        figurine.forEach(item => {
            const col = document.createElement('div');
            col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

            col.innerHTML = `
            <div class="figurina border p-3 mb-3 shadow-sm position-relative text-center">
                <!-- Copertura iniziale -->
                <div class="figurina-cover d-flex align-items-center justify-content-center">
                    <span class="text-white fw-bold">?</span>
                </div>

                <!-- Immagine e nome (inizialmente nascosti) -->
                <img
                    src="${item.immagine}"
                    alt="${item.nome}"
                    class="img-fluid figurina-image d-none"    
                >
                <h5 class="figurina-name d-none">
                    ${item.nome}
                </h5>

                <!-- Dettagli nascosti -->
                <div class="figurina-details collapse mt-2">
                    <p><strong>Description:</strong> ${item.descrizione || "Description not available"}</p>
                </div>
            </div>
            `;

            // Selezione gli elementi creati
            const figurinaCover = col.querySelector('.figurina-cover');
            const figurinaImage = col.querySelector('.figurina-image');
            const figurinaName = col.querySelector('.figurina-name');
            const details = col.querySelector('.figurina-details');

            // aggiunge l'evento di click per rilevare la figurina
            figurinaCover.addEventListener('click', () => {
                figurinaCover.classList.add('d-none');
                figurinaImage.classList.remove('d-none');
                figurinaName.classList.remove('d-none');
            });

            // aggiunge il toggle per i dettagli
            figurinaImage.addEventListener('click', () => {
                details.classList.toggle('show');
            });

            packContainer.appendChild(col);
        });
    }

    // Funzione per aggiornare i crediti dell'utente
    async function updateCredits() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` },
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
            const response = await fetch('http://127.0.0.1:3000/api/packs/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error);
                return;
            }

            const { cards, updatedCredits } = await response.json();

            // Aggiorna i crediti sul frontend
            creditsElement.textContent = `Crediti: ${updatedCredits}`;

            // Mostra le figurine acquistate
            renderFigurineComprate(cards);

        } catch (error) {
            console.error('Errore durante l\'acquisto del pacchetto:', error);
        }
    }

    // Aggiunge l'evento di click al bottone
    buyButton.addEventListener('click', BuyPack);

    // Aggiorna i crediti all'inizio
    updateCredits();
});