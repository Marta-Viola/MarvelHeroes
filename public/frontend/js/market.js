// logica per mostrare le cose che vanno caricate quando si accede alla pagina baratto.html

document.addEventListener('DOMContentLoaded', () => {
    // token per le varie autorizzazioni
    const token = localStorage.getItem('jwtToken');

    // elementi della sezione 1
    const marketTableBody = document.getElementById('marketplace-table');
    // var market1Button = document.getElementById('market1-btn');

    // elementi della sezione 2
    const figurinePosseduteContainer = document.getElementById('figurine-possedute-list');
    const figurineInVenditaContainer = document.getElementById('figurine-sul-mercato-list');
    const addToMarketButton = document.getElementById('add-to-market-btn');
    const removeFromMarketButton = document.getElementById('remove-from-market-btn');

    // elementi della sezione 3
    const figurina1Container = document.getElementById('baratto-uscita-in-cambio-di');

    // funzione per ottenere le figurine possedute dall'utente
    async function fetchUserFigurine() {
        try {
            // richiesta al backend delle figurine possedute dall'utente
            const response = await fetch('/api/market/figurine', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Errore durante il recupero delle figurine dell\'utente.");

            const data = await response.json();
            console.log("figurine possedute dall'utente: ", data.data.length);
            if (data.data.length === 0) {
                figurinePosseduteContainer.innerHTML = "<li>Nessuna figurina trovata.</li>";
            } else {
                renderFigurinePossedute(data.data);
            }

        } catch (error) {
            console.error("errore nel recupero delle tue figurine:", error);
            alert("errore nel recupero delle tue figurine");
        }
    }

    // funzione per mostrare le figurine possedute dall'utente
    function renderFigurinePossedute(figurine) {
        figurinePosseduteContainer.innerHTML = '';

        figurine.forEach(fig => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'align-items-center');
            li.id = fig.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input', 'me-2');
            li.appendChild(checkbox);

            const img = document.createElement('img');
            img.src = fig.thumbnail.path + '.' + fig.thumbnail.extension;
            img.alt = fig.name;
            img.classList.add('rounded', 'me-2');
            img.height = 40;
            img.width = 40;
            li.appendChild(img);

            const name = document.createElement('span');
            name.textContent = fig.name;
            // name.classList.add('text-light');
            // console.log("nome del personaggio: ", name);
            li.appendChild(name);

            figurinePosseduteContainer.appendChild(li);
        });
    }

    async function fetchUserFigurineInVendita() {
        try {
            // richiesta al backend delle figurine in vendita
            const response = await fetch('/api/market/figurineInVendita', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Errore durante il recupero delle figurine in vendita.");

            const data = await response.json();
            console.log("figurine in vendita: ", data.data.length);
            if (data.data.length === 0) {
                figurinePosseduteContainer.innerHTML = "<li>Nessuna figurina trovata.</li>";
            } else {
                renderFigurineInVendita(data.data);
            }
        
        } catch (error) {
            console.error("errore nel recupero delle figurine in vendita:", error);
            alert("errore nel recupero delle figurine in vendita");
        }
    }

    function renderFigurineInVendita(figurine) {
        figurineInVenditaContainer.innerHTML = '';

        figurine.forEach(fig => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'align-items-center');
            li.id = fig.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input', 'me-2');
            checkbox.id = fig.
            li.appendChild(checkbox);

            const img = document.createElement('img');
            img.src = fig.thumbnail.path + '.' + fig.thumbnail.extension;
            img.alt = fig.name;
            img.classList.add('rounded', 'me-2');
            img.height = 40;
            img.width = 40;
            li.appendChild(img);

            const name = document.createElement('span');
            name.textContent = fig.name;
            // name.classList.add('text-light');
            // console.log("nome del personaggio: ", name);
            li.appendChild(name);

            figurineInVenditaContainer.appendChild(li);
        });
    }

    async function fetchMarket() {
        try {
            const response = await fetch('/api/market/getMarket', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Errore durante il recupero delle figurine sul mercato.");

            const data = await response.json();
            console.log("figurine sul mercato (dati che arrivano):", data);
            if (data.length === 0) {
                console.log('non arriva niente');
            } else {
                renderMarket(data);
            }

        } catch (error) {
            console.error("errore nel recupero delle figurine sul mercato:", error);
            alert("errore nel recupero delle figurine sul mercato");
        }
    }

    function renderMarket(annuncio)  {
        marketTableBody.innerHTML = '';

        annuncio.forEach(elemento => {
            const tr = document.createElement('tr');
            tr.classList.add('bg-light');
            
            const username = document.createElement('td');
            username.textContent = elemento.username;
            username.classList.add('fw-strong');
            tr.appendChild(username);

            const figurina = document.createElement('td');
            figurina.classList.add('float-left');
            const img = document.createElement('img');
            img.src = elemento.imageUrl;
            img.alt = elemento.name;
            img.classList.add('rounded', 'me-2');
            img.height = 40;
            img.width = 40;
            figurina.appendChild(img);
            const name = document.createElement('span');
            name.textContent = elemento.figurinaName;
            figurina.appendChild(name);
            tr.appendChild(figurina);

            // bottone per proporre il baratto, vorrei che contenesse l'id dell'elemento Market!!!
            const baratto = document.createElement('td');
            baratto.id = elemento.marketId;
            const button = document.createElement('button');
            button.id = 'market1-btn';
            button.classList.add('btn', 'btn-primary', 'btn-sm');
            button.innerText = 'Proponi';
            baratto.appendChild(button);
            tr.appendChild(baratto);

            marketTableBody.appendChild(tr);
        });
    }

    // funzione per aggiungere le figurine al mercato
    // figurineIds sono un array di id di figurine prese dalle checkbox spuntate
    async function addToMarket(figurineIds) {
        console.log("figurineIds: ", figurineIds); 
        try {
            // manda al backend la richiesta per aggiungere le figurine al mercato
            // il backend vuole un array di figurineIds e l'utente autenticato
            const response = await fetch('/api/market/addToMarket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ figurineIds }),
            });
            if (!response.ok) throw new Error("Errore durante l'aggiunta delle figurine al mercato.");

            // const figurineInVendita = await response.json();

            // aggiorna il mercato
            fetchMarket();
            
            // aggiorna le figurine in vendita
            fetchUserFigurineInVendita();

            // aggiorna le figurine possedute
            fetchUserFigurine();
        } catch (error) {
            console.error("errore nell'aggiunta delle figurine al mercato:", error);
            alert("errore nell'aggiunta delle figurine al mercato");
        }
    }

    // funzione per gestire la rimozione dal mercato
    async function removeFromMarket(figurineIds) {
        try {
            const response = await fetch('/api/market/removeFromMarket', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ figurineIds }),
            });
            if (!response.ok) throw new Error("Errore durante la rimozione delle figurine dal mercato.");

            // aggiorna il mercato
            fetchMarket();

            // aggiorna le figurine in vendita e le possedute
            fetchUserFigurine();
            fetchUserFigurineInVendita();

        } catch (error) {
            console.error("errore nella rimozione delle figurine dal mercato:", error);
            alert("errore nella rimozione delle figurine dal mercato");
        }
    }

    // funzione per creare un trade
    // async function createTrade(market0, market1) {
    //     try {
    //         // invia al backend la richiesta di creare un trade
    //         const response = await fetch('/api/market/trade/create', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //             body: JSON.stringify({ market0, market1 }),
    //         });
    //         if (!response.ok) throw new Error("Errore durante la creazione del trade");

    //         // qui dovrebbe aggiungere il trade alla tabella 'proposte in uscita'

    //     } catch (error) {
    //         console.error('errore durante la creazione del trade', error);
    //         alert('errore durante la creazione del trade.');
    //     }
    // }

    // funzione per ottenere market0

    // funzione per ottenere market1
    async function fetchMarket1(market1Id) {
        try {
            // manda al backend l'id dell'elemento market
            // riceve i dati utili a renderizzarla
            const response = await fetch('/api/market/trade/getMarket1Element', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ market1Id }),
            });
            if (!response.ok) throw new Error("Errore durante il fetching di market1");

            const data = await response.json();
            if (data.length === 0) {
                console.log('non arrivano i dati');
            } else {
                renderMarket1(data);
            }

        } catch (error) {
            console.error('Errore durante il recupero di market1:', error);
            alert('errore durante la fetch di market1');
        }
    }

    function renderMarket1(item) {
        figurina1Container.innerHTML = '';

        figurina1Container.innerHTML = 
            `<img src="${item.imageUrl}" alt="${item.figurinaName}" class="img-fluid figurina-image">
             <h5 class="figurina-name text-light">${item.figurinaName}</h5> `;
        
        // trova un modo per salvare l'id del market element
    }

    // funzione per creare figurineIds da un array di checkbox spuntate
    function getSelectedPosseduteIds() {
        const checkboxes = figurinePosseduteContainer.querySelectorAll('input[type="checkbox"]:checked');
        console.log("checkboxes: ", checkboxes);

        // crea un array di id di figurine selezionate
        const figurineIds = [];
        checkboxes.forEach(checkbox => {
            figurineIds.push(checkbox.parentNode.id);
            console.log('checkbox id: ', checkbox.parentNode.id);
        });
        console.log("figurineIds: ", figurineIds);
        
        return figurineIds;
    }

    function getSelectedInVenditaIds() {
        const checkboxes = figurineInVenditaContainer.querySelectorAll('input[type="checkbox"]:checked');
        
        // crea un array di id figurine selezionate
        const figurineIds = [];
        checkboxes.forEach(checkbox => {
            figurineIds.push(checkbox.parentNode.id);
        });

        return figurineIds;
    }


    // gestione eventi
    addToMarketButton.addEventListener('click', () => {
        addToMarket(getSelectedPosseduteIds());
    });

    removeFromMarketButton.addEventListener('click', () => {
        removeFromMarket(getSelectedInVenditaIds());
    });

    // quando lo si clicca deve mandare l'elemento market al modulo di baratto
    marketTableBody.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' ) {
            const buttonData = event.target;
            const marketId = buttonData.parentNode.id;
            console.log('dati del bottone:', marketId);
            fetchMarket1(marketId);
        }
    });

    // chiamate finali per far andare le cose
    fetchUserFigurine();
    fetchUserFigurineInVendita();
    fetchMarket();
});

// ho bisogno di un qualcosa che selezionata una figurina con la checkbox, mi trovi l'id market corrispondente, così da poterlo mandare al backend
// oppure mando l'id utente e l'id figurina e faccio trovare l'id market al backend...
// proviamo così, usando getSelectedInVenditaIds()