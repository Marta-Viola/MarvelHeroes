document.addEventListener("DOMContentLoaded", () => {
    loadUserFigurine();
});

// recupera e mostra tutte le figurine possedute dall'utente
async function loadUserFigurine() {
    const userFigurineList = document.getElementById("figurine-possedute-list");

    try {
        const response = await fetch("/figurine"); //collegata a getUserFigurine nel backend... not true.
        if (!response.ok) throw new Error("Errore nel caricamento delle figurine possedute");

        const figurine = await response.json();
        userFigurineList.innerHTML = "";

        figurine.forEach(figurina => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "align-items-center");

            // checkbox per la selezione
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = figurina._id;
            checkbox.classList.add("me-2");

            // immagine della figurina
            const img = document.createElement("img");
            img.src = figurina.image;
            img.alt = figurina.name;
            img.classList.add("rounded", "me-2");
            img.style.width = "50px";

            // nome della figurina
            const name = document.createElement("span");
            name.textContent = figurina.name;

            listItem.appendChild(checkbox);
            listItem.appendChild(img);
            listItem.appendChild(name);
            userFigruineList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Errore nel recupero delle figurine:", error);
    }
}

// aggiunge le figurine selezionate al mercato
document.getElementById("add-to-market-btn").addEventListener("click", async () => {
    const selectedFigurine = Array.from(document.querySelectorAll("#figurine-possedute-list input:checked"))
        .map(checkbox => checkbox.value);

    if (selectedFigurine.length === 0) return alert("Seleziona almeno una figurina!");

    try {
        const response = await fetch("/market/add", {   //non esiste questa rotta...
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ figurine: selectedFigurine })
        });

        if (!response.ok) throw new Error("Errore nell\'aggiunta al mercato");

        alert("Figurine aggiunte con successo!");
        loadUserFigurine(); // ricarica la lista
        loadMarketFigurine();   // ricarica il mercato

    } catch (error) {
        console.error("Errore nell\'aggiunta al mercato:", error);
    }
});

// mostra la lista delle figurine possedute
// permette di selezionare più figurine e metterle sul mercato
// aggiorna la lista dopo ogni modifica