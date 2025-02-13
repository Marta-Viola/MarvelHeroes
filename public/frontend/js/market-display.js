document.addEventListener("DOMContentLoaded", () => {
    const marketTableBody = document.getElementById("marketplace-table");;

    if (marketTableBody) {
        fetchMarketItems();
    }
});

// funzione per recuperare le figurine in vendita dal backend e mostrarle nella tabella
async function fetchMarketItems() {
    try {
        const token = localStorage.getItem("jwtToken");

        const response = await fetch("/api/market", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Errore nel caricamento del mercato");

        const marketItems = await response.json();
        renderMarketTable(marketItems);

    } catch (error) {
        console.error("Errore nel recupero delle figurine:", error);
    }
}

// funzione per aggiornare dinamicamente la tabella del mercato
function renderMarketTable(marketItems) {
    const marketTableBody = document.getElementById("marketplace-table");
    marketTableBody.innerHTML = ""; // rimuove tutti i tr

    if (marketItems.length === 0) {
        marketTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Nessuna figurina sul mercato</td></tr>`;
        return;
    }

    marketItems.forEach(item => {
        const row = document.createElement("tr");

        // colonna utente
        const userCell = document.createElement("td");
        userCell.innerHTML = `<strong>${item.userId.username}</strong>`;
        row.appendChild(userCell);

        // colonna figurina proposta (immagine + nome)
        const figurinaCell = document.createElement("td");
        // aggiungi la logica per mostrare l'immagine
        figurinaCell.innerHTML = `
            <div class="d-flex align-items-center">
                <img alt="figurina">
                <span>${item.figurinaId}</span>
            </div>`;
        row.appendChild(figurinaCell);

        // colonna bottone "Proponi Baratto"
        const actionCell = document.createElement("td");
        const proposeButton = document.createElement("button");
        proposeButton.classList.add("btn", "btn-primary", "btn-sm");
        proposeButton.textContent = "Proponi Baratto";
        proposeButton.dataset.userId = item.userId._id; // memorizza l'ID dell'utente
        proposeButton.dataset.figurinaId = item.figurinaId; // memorizza l'ID della figurina
        proposeButton.addEventListener("click", () => openTradeModal(item));
        actionCell.appendChild(proposeButton);
        row.appendChild(actionCell);

        marketTableBody.appendChild
    });
}

// funzione per aprire il modale di proposta di baratto
function openTradeModal(item) {
    console.log("non sarà proprio così ma poi vedremo");
}

// quando la pagina si carica viene chiamata fetchMarketTable()
// questa funzione fa una richiesta GET al backend (/market) per recuperare le figurine disponibili
// renderMarketTable() aggiorna dinamicamente la tabella con i dati ricevuti
// per ogni riga, viene creato un bottone "Proponi Baratto", che in futuro aprirà un modale...