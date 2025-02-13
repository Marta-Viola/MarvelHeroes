document.addEventListener("DOMContentLoaded", () => {
    loadMarketFigurine();
});

// recupera e mostra le figurine messe in mercato dell'utente
async function loadMarketFigurine() {
    const marketFigurineList = document.getElementById("figurine-sul-mercato-list");

    try {
        const response = await fetch("/market/user");
        if (!response.ok) throw new Error("Errore nel caricamento delle figurine sul mercato");

        const figurine = await response.json();
        marketFigurineList.innerHTML = "";

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
            marketFigurineList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Errore nel recupero delle figurine sul mercato:", error);
    }
}

// rimuove dal mercato le figurine selezionate
document.getElementById("remove-from-market-btn").addEventListener("click", async () => {
    const selectedFigurine = Array.from(document.querySelectorAll("#figurine-sul-mercato-list input:checked"))
        .map(checkbox => checkbox.value);
    
    if (selectedFigurine.length === 0) return alert("Seleziona almeno una figurina!");

    try {
        const response = await fetch("market/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ figurine: selectedFigurine })
        });

        if (!response.ok) throw new Error("Errore nella rimozione");

        alert("Figurine rimosse con successo!");
        loadMarketFigurine();

    } catch (error) {
        console.error("Errore nella rimozione:", error);
    }
});

// sposta la figurina selezionata nella sezione "Baratto in uscita"
document.getElementById("propose-trade-btn").addEventListener("click", () => {
    const selectedFigurine = Array.from(document.querySelectorAll("#figurine-sul-mercato-list input:checked"));

    if (selectedFigurine.length !== 1) return alert("Seleziona una sola figurina per il baratto!");

    const figurinaId = selectedFigurine[0].value;
    const figurinaName = selectedFigurine[0].nextSibiling.nextSibiling.textContent;
    const figurinaImg = selectedFigurine[0].nextSibling.src;

    // inserisce la figurina selezionata nella sezione di baratto (da gestire più avanti)
    document.getElementById("baratto-uscita-tu-dai").innerHTML = `
        <img src="${figurinaImg}" class="rounded" style="width:100px;">
        <p>${figurinaName}</p>
    `;

    // salva l'ID della figurina per il baratto
    document.getElementById("baratto-uscita-tu-dai").dataset.figurinaId = figurinaId;
});

// mostra la lista delle figurine già in mercato
// permette di rimuovere le figurine selezionate dal mercato
// consente di scegliere una figurina per iniziare il
