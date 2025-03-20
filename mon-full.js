import { getFS, loadMonsFromCsv, loadMovesFromCsv } from "./utils.js";
import { typeData } from "./type-data.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Load mon and move data from CSVs
    const monsFromCsv = await loadMonsFromCsv();
    const movesFromCsv = await loadMovesFromCsv();

    let monIndex = 0;

    // Bind to prev/next buttons to update index
    document.querySelector("#prev-mon-btn").addEventListener("click", () => {
        monIndex = (monIndex - 1 + monsFromCsv.length) % monsFromCsv.length;
        loadMon();
    });
    document.querySelector("#next-mon-btn").addEventListener("click", () => {
        monIndex = (monIndex + 1 + monsFromCsv.length) % monsFromCsv.length;
        loadMon();
    });

    // Load the first mon
    loadMon();

    function loadMon() {
        // Load the mon's data and moves in the container
        document.querySelector("#mon-container-name").innerHTML = '<img src="imgs/' + monsFromCsv[monIndex].Name.toLowerCase() + '_mini.gif" alt="' + monsFromCsv[monIndex].Name + '">' + '<div>' + monsFromCsv[monIndex].Name + '</div>';
    }
});
