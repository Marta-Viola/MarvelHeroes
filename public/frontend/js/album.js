document.addEventListener("DOMContentLoaded", () => {
    // elementi della pagina
    const albumContainer = document.getElementById("album-container");
    
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");

    const prevButton = document.getElementById("prev-btn");
    const nextButton = document.getElementById("next-btn");
    const pageInfo = document.getElementById("page-info");

    let currentPage = 1;
    let totalPages = 1;
    let query = "";

    // funzione per aggiornare l'URL senza ricaricare la pagina
    function updateURL(page, query) {
        const url = new URL(window.location);
        url.searchParams.set("page", page);
        url.searchParams.set("name", query);
        window.history.pushState({}, "", url);  // aggiorna URL
    }

    // funzione per ottenere le figurine possedute
    async function fetchAlbum(page, query) {
        try {
            const token = localStorage.getItem("jwtToken");

            // richiesta al backend
            const response = await fetch(`/api/album?page=${page}&limit=12&name=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Errore durante il recupero dell\'album");
            }

            const data = await response.json();

            // se non ci sono risultati, mostra un messaggio
            if (data.data.length === 0) {
                albumContainer.innerHTML = "<p>Nessuna figurina trovata.</p>";
            } else {
                renderAlbum(data.data);
            }

            currentPage = data.page;
            totalPages = data.totalPages;
            updatePagination(currentPage, totalPages);

        } catch (error) {
            console.error(error);
            alert("Errore durante il caricamento dell\'album");
        }
    }

    // funzione per mostrare le figurine in pagina
    function renderAlbum(figurine) {
        albumContainer.innerHTML = '';
        figurine.forEach(item => {
            const col = document.createElement('div');
             col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

             col.innerHTML = `
             <div class="figurina border p-3 mb-3 shadow-sm position-relative text-center">
                 <img src="${item.thumbnail.path}.${item.thumbnail.extension}" alt="${item.name}" class="img-fluid figurina-image">
                 <h5 class="figurina-name">${item.name}</h5>

                 <!-- Dettagli nascosti -->
                 <div class="figurina-details collapse mt-2">
                     <p><strong>Description:</strong> ${item.description || "Description not available"}</p>
                     <p><strong>Comics:</strong> ${item.comics.available}</p>
                     <p><strong>Series:</strong> ${item.series.available}</p>
                     <p><strong>Stories:</strong> ${item.stories.available}</p>
                     <p><strong>Events:</strong> ${item.events.available}</p>
                 </div>
             </div>`;

             const image = col.querySelector('.figurina-image');
             const details = col.querySelector('.figurina-details');

             image.addEventListener('click', () => {
                 details.classList.toggle('show');
             });

             albumContainer.appendChild(col);
        });
    }

    function updatePagination(page, totalPages) {
        pageInfo.textContent = `${page} / ${totalPages}`;
        prevButton.disabled = page === 1;
        nextButton.disabled = page === totalPages;
    }

    // evento di submit per la ricerca
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        query = searchInput.value.trim();
        updateURL(1, query);
        fetchAlbum(1, query);
    });

    prevButton.addEventListener('click', () => {
        const prevPage = currentPage - 1;
        updateURL(prevPage, query);
        fetchAlbum(prevPage, query);
    });

    nextButton.addEventListener('click', () => {
        const nextPage = currentPage + 1;
        updateURL(nextPage, query);
        fetchAlbum(nextPage, query);
    });

    fetchAlbum(currentPage, query);
});