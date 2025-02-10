document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Recupera il token dalla memoria locale
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            window.location.href = '/api/login';
            return;
        }

        // Decodifica e usa il token per recuperare i dati utente
        const userResponse = await fetch('http://127.0.0.1:3000/api/auth/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error('Errore durante il recupero dei dati utente');
        }

        const userData = await userResponse.json();
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Ciao, ${userData.username}`;

        //Inizializza la griglia delle figurine
        initializeFigurineGrid(token);
    } catch (error) {
        console.error(error);
        alert('Errore durante il recupero delle informazioni dell\'utente. Reindirizzamento al login.');
        window.location.href = '/api/login';
    }
});

async function initializeFigurineGrid(token) {
    const gridContainer = document.getElementById('grid-container');

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    let currentPage = 1;
    const itemsPerPage = 12;
    let totalPages = 0; //sarà aggiornato dinamicamente

    let searchQuery = ''; // Query di ricerca

    async function fetchFigurine(page, query = '') {
        try {
            console.log(`Fetching page ${page} with query "${query}", totalPages = ${totalPages}`);    //log di debug

            const response = await fetch(`http://127.0.0.1:3000/api/figurine?page=${page}&limit=${itemsPerPage}&name=${encodeURIComponent(query)}`, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Errore durante il recupero delle figurine');
            }

            const data = await response.json();

            //aggiorna il totale delle pagine
            totalPages = data.totalPages;

            // Mostra un messaggio se non ci sono risultati
            if (data.results.length === 0) {
                renderNoResultsMessage();    // funzione per il messaggio
                updatePagination(0, 0);
                return;   
            }

            //se ci sono risultati aggiorna la griglia
            renderFigurine(data.results);

            //aggiorna la paginazione
            totalPages = data.totalPages;
            updatePagination(data.page, data.totalPages);

        } catch (error) {
            console.error(error);
            alert('Errore durante il caricamento delle figurine.');
        }
    }

    //Funzione per resettare la griglia
    function resetGrid() {
        gridContainer.innerHTML = '';   //Svuota la griglia
        renderNoResultsMessage();   //mostra il messaggio per default
        totalPages = 0;
        updatePagination(0, 0); //Disabilita la paginazione
    }

    //Funzione per gestire l'input nella barra di ricerca
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newQuery = searchInput.value.trim();

        if (newQuery === searchQuery) {
            //se la query non cambia, non eseguire una nuova ricerca
            return;
        }

        //aggiorna la query e resetta la griglia
        searchQuery = newQuery;
        currentPage = 1;
        resetGrid();

        if (searchQuery) {
            //recupera le figurine se la query non è vuota
            fetchFigurine(currentPage, searchQuery);
        }
    });

    function renderFigurine(figurine) {
        gridContainer.innerHTML = ''; // Pulisci la griglia precedente
        
        figurine.forEach(item => {
            const col = document.createElement('div');
            col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

            col.innerHTML = `
            <div class="figurina border p-3 mb-3 shadow-sm position-relative">
                <!-- Immagine e Nome -->
                <img 
                    src="${item.thumbnail.path}.${item.thumbnail.extension}" 
                    alt="${item.name}" 
                    class="img-fluid figurina-image" 
                >
                <h5 class="figurina-name position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 m-2">
                    ${item.name}
                </h5>
                
                <!-- Dettagli nascosti -->
                <div class="figurina-details collapse mt-2">
                    <p><strong>Description:</strong> ${item.description || "Description not available"}</p>
                    <p><strong>Comics:</strong> ${item.comics.available}</p>
                    <p><strong>Series:</strong> ${item.series.available}</p>
                    <p><strong>Stories:</strong> ${item.stories.available}</p>
                    <p><strong>Events:</strong> ${item.events.available}</p>
                </div>
            </div>
            `;

            //Aggiunge l'evento di toggle per la tendina
            const image = col.querySelector('.figurina-image');
            const details = col.querySelector('.figurina-details');
            
            image.addEventListener('click', () => {
                details.classList.toggle('show');
            });
            
            gridContainer.appendChild(col);
        });
    }

    function updatePagination(page, totalPages) {
        currentPage = page;
        pageInfo.textContent = `${page} / ${totalPages}`;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= totalPages;
    }

    function renderNoResultsMessage() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';   //svuota la griglia

        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Nessun risultato trovato.';
        noResultsMessage.className = 'text-center text-muted mt-3';
        gridContainer.appendChild(noResultsMessage);
    }

    //Eventi per i pulsanti
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage -= 1;
            fetchFigurine(currentPage, searchQuery);    //passa la query di ricerca
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage += 1;
            fetchFigurine(currentPage, searchQuery);
        }
    });

    // Listener per il form di ricerca
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        searchQuery = searchInput.value.trim(); //ottiene la query di ricerca
        currentPage = 1;
        fetchFigurine(currentPage, searchQuery);    //Recupera i risultati filtrati
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); //evita il comportamento predefinito
            searchQuery = searchInput.value.trim();    // aggiorna la variabile con la query dell'utente
            currentPage = 1;    //resetta alla pagina 1 per una nuova ricerca
            fetchFigurine(currentPage, searchQuery);    //richiama fetchFigurine
        }
    })

    //inizializza con la prima pagina
    fetchFigurine(currentPage);
}
