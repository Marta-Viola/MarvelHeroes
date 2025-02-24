// logica per mostrare le cose che vanno caricate quando si accede alla pagina baratto.html

document.addEventListener('DOMContentLoaded', () => {
    // token per le varie autorizzazioni
    const token = localStorage.getItem('jwtToken');

    // span username
    const usernameSpan = document.getElementById('username-span');

    // elementi della sezione 1
    const marketTableBody = document.getElementById('marketplace-table');
    // var market1Button = document.getElementById('market1-btn');

    // elementi della sezione 2
    const figurinePosseduteContainer = document.getElementById('figurine-possedute-list');
    const figurineInVenditaContainer = document.getElementById('figurine-sul-mercato-list');
    const addToMarketButton = document.getElementById('add-to-market-btn');
    const removeFromMarketButton = document.getElementById('remove-from-market-btn');
    const proposeFig0Button = document.getElementById('propose-trade-btn'); 

    // elementi della sezione 3
    const tradeEntrataContainer = document.getElementById('proposte-scambio-list')
    const userTraderSpan = document.getElementById('username0-span');
    const figurinaOutContainer = document.getElementById('scambio-figurina-out');
    const figurinaInContainer = document.getElementById('scambio-figurina-in');
    const tradeUscitaContainer = document.getElementById('storico-proposte-list');
    const destinatarioBarattoSpan = document.getElementById('username-destinatario');
    const figurina0Cointainer = document.getElementById('baratto-uscita-tu-dai');
    const figurina1Container = document.getElementById('baratto-uscita-in-cambio-di');
    const proposeTradeButton = document.getElementById('proponi-baratto-btn');

    // funzione per ottenere l'username dell'utente
    async function fetchUsername() {
        try {
            const response = await fetch('/api/market/username', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Errore durante il recupero dell\'username.');

            const data = await response.json();
            if (!data) usernameSpan.innerText = 'Non so chi tu sia';
            else usernameSpan.innerText = data.username;
        } catch (error) {
            console.error("errore nel recupero del tuo username:", error);
            alert("errore nel recupero del tuo username");
        }
    }

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
            console.log("figurine in vendita: ", data.data);
            if (data.data.length === 0) {
                figurineInVenditaContainer.innerHTML = "<li>Nessuna figurina trovata.</li>";
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
            checkbox.id = fig.id;
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

            if (figurineInVenditaContainer) figurineInVenditaContainer.appendChild(li);
            else console.error('figurineInVenditaContainer è undefined..');
            
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

    // funzione per ottenere market0
    // deve mandare l'id della figurina!!
    async function fetchMarket0(fig0Id) {
        try {
            console.log('fig0Id = ', fig0Id);
            const response = await fetch('/api/market/trade/getMarket0Element', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ fig0Id }),
            });
            if (!response.ok) throw new Error("Errore durante il fetching per market0");

            // data = {username, imageUrl, figurinaName, idFigurina, marketId}
            const data = await response.json();
            if (data.length === 0) console.log('non arrivano i dati a market0');
            else renderMarket0(data);

        } catch (error) {
            console.error('Errore durante il recupero di market0:', error);
            alert('errore durante la fetch di market0'); 
        }
    }

    function renderMarket0(item) {
        figurina0Cointainer.innerHTML = '';

        figurina0Cointainer.innerHTML = 
            `<div class="figurina border p-3 mb-3 shadow-sm position-relative text-center w-100" id="${item.marketId}">
                <img src="${item.imageUrl}" alt="${item.figurinaName}" class="img-fluid figurina-image">
                <h5 class="figurina-name text-light">${item.figurinaName}</h5>
            </div> `;
    }

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
                console.log('non arrivano i dati a market1');
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
            `<div class="figurina border p-3 mb-3 shadow-sm position-relative text-center w-100" id="${item.marketId}">
                <img src="${item.imageUrl}" alt="${item.figurinaName}" class="img-fluid figurina-image">
                <h5 class="figurina-name text-light">${item.figurinaName}</h5>
            </div> `;

        destinatarioBarattoSpan.innerHTML = '';
        destinatarioBarattoSpan.innerText = item.username;
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

    // funzione per prendere i marketId delle figurine nella proposta di trade
    // è l'id del figlio di figurina0Container e di figurina1Container
    function getMarketId() {
        const market0Id = figurina0Cointainer.children[0].id;
        const market1Id = figurina1Container.children[0].id;
        return [market0Id, market1Id];
    }

    // funzione per mandare gli id market e far creare il trade al backend
    async function sendTrade(market0Id, market1Id) {
        try {
            console.log('market0Id = ', JSON.stringify(market0Id), 'market1Id = ', JSON.stringify(market1Id));
            const response = await fetch('/api/market/trade/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ market0Id, market1Id }),
            });
            if (!response.ok) throw new Error("Errore durante la creazione del trade.");

            const data = await response.json();
            if (data.length === 0) {
                console.log('non arrivano i dati del trade');
            } else {
                // fetchProposteInUscita(data);

                // aggiorna tutto
                fetchMarket();
                fetchUserFigurineInVendita();
                fetchTradeInUscita();
                figurina0Cointainer.innerHTML = '';
                figurina1Container.innerHTML = '';
            }

        } catch (error) {
            console.error('Errore durante la creazione del trade:', error);
            alert('errore durante la creazione del trade');
        }
    }

    // funzione per fetchare i trade in uscita
    async function fetchTradeInUscita() {
        try {
            const response = await fetch('/api/market/trade/getTradeUscita', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Errore durante il fetching di trade in uscita.");

            const data = await response.json();
            if (data.length === 0) {
                console.log('non arrivano i dati del trade in uscita');
            } else {
                renderTradeInUscita(data.tradeDetails);
            }

        } catch (error) {
            console.error('Errore durante il fetching di trade in uscita:', error);
            alert('errore durante il fetching di trade in uscita');
        }
    }

    // funzione per renderizzare i trade in uscita
    // hai proposto a / di scambiare / in cambio di / stato
    // => user1 / fig0 / fig1 / status
    // dati ritornati da fetchTradeInUscita:
    //     username0: username0,
    //     fig0img: fig0img,
    //     fig0name: fig0name,
    //     fig1img: fig1img,
    //     fig1name: fig1name,
    //     username1: username1,
    //     status: trade.status
    function renderTradeInUscita(trades) {
        console.log('trades: ', trades);
        
        if (trades.length !== 0) {
            tradeUscitaContainer.innerHTML = '';

            trades.forEach(trade => {
                const tr = document.createElement('tr');
                tr.classList.add('bg-light');
    
                // hai proposto a
                const user1 = document.createElement('td');
                user1.textContent = trade.username1; 
                user1.classList.add('fw-strong');
                tr.appendChild(user1);
    
                // di scambiare
                const fig0 = document.createElement('td');
                fig0.classList.add('float-left');
                const img0 = document.createElement('img');
                img0.src = trade.fig0img;
                img0.alt = trade.fig0name;
                img0.classList.add('rounded', 'me-2');
                img0.height = 40;
                img0.width = 40;
                fig0.appendChild(img0);
                const fig0name = document.createElement('span');
                fig0name.textContent = trade.fig0name;
                fig0name.classList.add('fw-bold');
                fig0.appendChild(fig0name);
                tr.appendChild(fig0);
    
                // in cambio di
                const fig1 = document.createElement('td');
                fig1.classList.add('float-left');
                const img1 = document.createElement('img');
                img1.src = trade.fig1img;
                img1.alt = trade.fig1name;
                img1.classList.add('rounded', 'me-2');
                img1.height = 40;
                img1.width = 40;
                fig1.appendChild(img1);
                const fig1name = document.createElement('span');
                fig1name.textContent = trade.fig1name;
                fig1name.classList.add('fw-bold');
                fig1.appendChild(fig1name);
                tr.appendChild(fig1);
    
                // status
                const status = document.createElement('td');
                if (trade.status === 'pendente') {
                    // colore arancione
                    status.classList.add('text-warning');
                } else if (trade.status === 'accettato') {
                    // colore verde
                    status.classList.add('text-success');
                } else if (trade.status === 'rifiutato') {
                    // colore rosso
                    status.classList.add('text-danger');
                }
                status.textContent = trade.status;
                tr.appendChild(status);
    
                tradeUscitaContainer.appendChild(tr);
            });
        }  else {
            tradeUscitaContainer.innerHTML = 
                `<tr class="bg-light">
                    <td colspan="4" class="text-muted py-3">Nessuna proposta disponibile</td>
                </tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        }
    }

    //funzione per fetchare i trade in entrata
    async function fetchTradeInEntrata() {
        try {
            const response = await fetch('/api/market/trade/getTradeEntrata', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Errore durante il fetching di trade in entrata.");

            const data = await response.json();
            if (data.length === 0) {
                console.log('non arrivano i dati del trade in entrata');
            } else {
                renderTradeInEntrata(data.tradeDetails);
            }

        } catch (error) {
            console.error('Errore durante il fetching di trade in entrata:', error);
            alert('errore durante il fetching di trade in entrata');
        }
    }

    // funzione per renderizzare i trade in entrata
    // utente / ti da / in cambio di / azioni
    // dati ritornati da fetchTradeInEntrata:
    //     username0: username0,
    //     fig0img: fig0img,
    //     fig0name: fig0name,
    //     fig1img: fig1img,
    //     fig1name: fig1name,
    //     username1: username1,
    //     status: trade.status
    function renderTradeInEntrata(trades) {
        console.log('trades: ', trades);

        if (trades.length !== 0) {
            tradeEntrataContainer.innerHTML = '';

            trades.forEach(trade => {
                const tr = document.createElement('tr');
                // tr.classList.add('bg-light');
                if (trade.status === 'pendente') {
                    // colore arancione
                    tr.classList.add('bg-warning', 'bg-opacity-75');
                } else if (trade.status === 'accettato') {
                    // colore verde
                    tr.classList.add('bg-success', 'bg-opacity-75');
                } else if (trade.status === 'rifiutato') {
                    // colore rosso
                    tr.classList.add('bg-danger', 'bg-opacity-75');
                }
    
                // utente
                const user0 = document.createElement('td');
                user0.textContent = trade.username0; 
                // console.log('(renderTableInEntrata) trade.username0: ', trade.username0);
                user0.classList.add('fw-bold');
                tr.appendChild(user0);
    
                // ti da
                const fig0 = document.createElement('td');
                // fig0.classList.add('float-left');
                const divFig0 = document.createElement('div');
                divFig0.classList.add('d-flex', 'align-items-center');
                
                const img0 = document.createElement('img');
                img0.src = trade.fig0img;
                img0.alt = trade.fig0name;
                img0.classList.add('rounded', 'me-2');
                img0.height = 40;
                img0.width = 40;
                divFig0.appendChild(img0);
                
                const fig0name = document.createElement('span');
                fig0name.textContent = trade.fig0name;
                fig0name.classList.add('fw-bold', 'text-truncate');
                fig0name.style.maxWidth = '150px';
                divFig0.appendChild(fig0name);
                fig0.appendChild(divFig0);
                tr.appendChild(fig0);
    
                // in cambio di
                const fig1 = document.createElement('td');
                // fig1.classList.add('float-left');
                const divFig1 = document.createElement('div');
                divFig1.classList.add('d-flex', 'align-items-center');
    
                const img1 = document.createElement('img');
                img1.src = trade.fig1img;
                img1.alt = trade.fig1name;
                img1.classList.add('rounded', 'me-2');
                img1.height = 40;
                img1.width = 40;
                divFig1.appendChild(img1);
    
                const fig1name = document.createElement('span');
                fig1name.textContent = trade.fig1name;
                fig1name.classList.add('fw-bold', 'text-truncate');
                fig1name.style.maxWidth = '150px';
                divFig1.appendChild(fig1name);
                fig1.appendChild(divFig1);
                tr.appendChild(fig1);
    
                // azioni!
                // bottoni per accettare o rifiutare il trade
                const actions = document.createElement('td');
                const divActions = document.createElement('div');
                divActions.classList.add('d-flex', 'flex-wrap', 'justify-content-between');
                // actions.classList.add('d-flex', 'justify-content-between');
                
                if (trade.status === 'pendente') {
                    const acceptButton = document.createElement('button');
                    acceptButton.type = 'submit';
                    acceptButton.classList.add('btn', 'btn-sm', 'btn-success', 'w-100');
                    acceptButton.textContent = 'Accetta';
                    acceptButton.addEventListener('click', () => {
                        acceptTrade(trade.tradeId);
                    });
    
                    const rejectButton = document.createElement('button');
                    rejectButton.type = 'submit';
                    rejectButton.classList.add('btn', 'btn-sm', 'btn-danger', 'w-100');
                    rejectButton.textContent = 'Rifiuta';
                    rejectButton.addEventListener('click', () => {
                        rejectTrade(trade.tradeId);
                });
    
                divActions.appendChild(acceptButton);
                divActions.appendChild(rejectButton);
                } else {
                    actions.innerHTML = '';
                }

                actions.appendChild(divActions);
                tr.appendChild(actions);
                
                tradeEntrataContainer.appendChild(tr);
            });
        } else {
            tradeEntrataContainer.innerHTML = 
                `<tr class="bg-light">
                    <td colspan="4" class="text-muted py-3">Nessuna proposta disponibile</td>
                </tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr class="bg-light"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        }
    }

    async function rejectTrade(tradeId) {
        console.log('(rejectTrade) tradeId: ', tradeId);
        try {
            const response = await fetch('/api/market/trade/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tradeId: tradeId })
            });
            if (!response.ok) {
                throw new Error('Impossibile rifiutare il trade');
            }

            const data = await response.json();
            console.log('trade rifiutato: ', data);

            fetchTradeInEntrata();

        } catch (error) {
            console.error('Impossibile rifiutare il trade:', error);
            alert('Impossibile rifiutare il trade');
        }
    }

    async function acceptTrade(tradeId) {
        try {
            const response = await fetch('/api/market/trade/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tradeId: tradeId })
            });
            if (!response.ok) {
                throw new Error('Impossibile accettare il trade');
            }

            const data = await response.json();
            console.log('Trade accettato: ', data);
            console.log('data.tradeDetails = ', data.tradeDetails); 
            if (data.length === 0) {
                console.log('non arrivano i dati del trade accettato.');
            } else {
                renderTradeAccettato(data.tradeDetails);
                fetchTradeInEntrata();
                fetchMarket();
            }

            // bisogna mostrare il trade appena accettato
            // ma abbiamo i figObj = {(int) idPersonaggio, (String) nome, (obj) _id}
            // manca solo l'immagine T-T

            // data ora è tradeDetails yay

            // qui c'è un errore perché l'accettazione non va abuon fineee
            // ah... avevo messo /reject come trade... quindi ora il trade è rifiutato :(

        } catch (error) {
            console.error('Errore durante l\'accettazione del trade', error);
            alert('errore durante l\'accettazione del trade');
        }
    }

    function renderTradeAccettato(trade) {
        userTraderSpan.innerHTML = '';
        figurinaOutContainer.innerHTML = '';
        figurinaInContainer.innerHTML = '';

        // 'con'
        userTraderSpan.innerText = trade.username1;

        console.log('(renderTradeAccettazione) trade.fig1name: ', trade.fig1name);

        // 'hai dato' => fig1
        figurinaOutContainer.innerHTML =
            `<div class="figurina border p-3 mb-3 shadow-sm position-relative text-center w-100">
                <img src="${trade.fig1img}" alt="${trade.fig1name}" class="img-fluid figurina-image">
                <h5 class="figurina-name text-light">${trade.fig1name}</h5>
            </div> `;
        
        // 'in cambio di' => fig0
        figurinaInContainer.innerHTML =
            `<div class="figurina border p-3 mb-3 shadow-sm position-relative text-center w-100">
                <img src="${trade.fig0img}" alt="${trade.fig0name}" class="img-fluid figurina-image">
                <h5 class="figurina-name text-light">${trade.fig0name}</h5>
            </div> `;
    }

    // gestione eventi
    addToMarketButton.addEventListener('click', () => {
        addToMarket(getSelectedPosseduteIds());
    });

    removeFromMarketButton.addEventListener('click', () => {
        removeFromMarket(getSelectedInVenditaIds());
    });

    proposeFig0Button.addEventListener('click', () => {
        const selected = getSelectedInVenditaIds();
        console.log('figurine checkate: ', selected);
        fetchMarket0(selected);
    });

    // quando si clicca un bottone della tabella deve mandare l'elemento market al modulo di baratto
    marketTableBody.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' ) {
            const buttonData = event.target;
            const marketId = buttonData.parentNode.id;
            console.log('dati del bottone:', marketId);
            fetchMarket1(marketId);
        }
    });

    // quando lo si clicca bisogna chiamare sendTrade
    proposeTradeButton.addEventListener('click', () => {
        const elementi = getMarketId();
        sendTrade(elementi[0], elementi[1]);
    });

    // chiamate finali per far andare le cose
    fetchUsername();
    fetchUserFigurine();
    fetchUserFigurineInVendita();
    fetchMarket();
    fetchTradeInEntrata();
    fetchTradeInUscita();
});

// ho bisogno di un qualcosa che selezionata una figurina con la checkbox, mi trovi l'id market corrispondente, così da poterlo mandare al backend
// oppure mando l'id utente e l'id figurina e faccio trovare l'id market al backend...
// proviamo così, usando getSelectedInVenditaIds()