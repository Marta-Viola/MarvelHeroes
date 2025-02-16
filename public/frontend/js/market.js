// logica per mostrare le cose che vanno caricate quando si accede alla pagina baratto.html

document.addEventListener('DOMContentLoaded', () => {
    // token per le varie autorizzazioni
    const token = localStorage.getItem('jwtToken');

    // elementi della sezione 2
    const figurinePosseduteContainer = document.getElementById('figurine-possedute-list');
    const figurineInVenditaContainer = document.getElementById('figurine-sul-mercato-list');
    const addToMarketButton = document.getElementById('add-to-market-btn');

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
            li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'bg-dark');
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
            name.classList.add('text-light');
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
            li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'bg-dark');
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
            name.classList.add('text-light');
            // console.log("nome del personaggio: ", name);
            li.appendChild(name);

            figurineInVenditaContainer.appendChild(li);
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

            const figurineInVendita = await response.json();

            // aggiorna il mercato
            // ...
            
            // aggiorna le figurine in vendita
            fetchUserFigurineInVendita();

            // aggiorna le figurine possedute
            fetchUserFigurine();
        } catch (error) {
            console.error("errore nell'aggiunta delle figurine al mercato:", error);
            alert("errore nell'aggiunta delle figurine al mercato");
        }
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

    // gestione eventi
    addToMarketButton.addEventListener('click', () => {
        addToMarket(getSelectedPosseduteIds());
    });

    // chiamate finali per far andare le cose
    fetchUserFigurine();
    fetchUserFigurineInVendita();
});