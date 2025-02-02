// gestisce la fetch e il rendering delle figurine
document.addEventListener('DOMContentLoaded', () => {
    const albumContainer = document.getElementById('album-container');
    const searchInput = document.getElementById('search-input');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    let currentPage = 1;
    const itemsPerPage = 12;
    let totalPages = 1;

    async function fetchAlbum(page, query = '') {
        try {
            // Recupera il token dalla memoria locale
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                window.location.href = '/api/login';
                return;
            }
            
            const response = await fetch(`/api/album?page=${page}&limit=${itemsPerPage}&name=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` 
                },
            });

            if (!response.ok) {
                throw new Error('Errore durante il recupero dell\'album');
            }

            const data = await response.json();
            console.log('data: ', data);
            console.log('data.figurine:', data.figurine);

            renderAlbum(data.figurine);
            totalPages = data.totalPages;
            updatePagination(page, totalPages);

        } catch (error) {
            console.error(error);
            alert('Errore durante il caricamento dell\'album');
        }
    }

    function renderAlbum(figurine) {
        albumContainer.innerHTML = '';
        figurine.forEach(item => {
            const col = document.createElement('div');
            col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

            col.innerHTML = `
            <div class="figurina border p-3 mb-3 shadow-sm position-relative text-center">
                <img src="${item.thumbnail.path}.${item.thumbnail.extension}" alt="${item.name}" class="img-fluid figurina-image">
                <h5 class="figurina-name">${item.name}</h5>
            </div>`;

            albumContainer.appendChild(col);
        });
    }

    function updatePagination(page, total) {
        pageInfo.textContent = `Pagina ${page} di ${total}`;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= total;
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAlbum(currentPage, searchInput.value);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAlbum(currentPage, searchInput.value);
        }
    });

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        fetchAlbum(currentPage, searchInput.value);
    });

    fetchAlbum(currentPage);
});