
import { monsterMovesData } from "./default-moves.js";
import { defaultMonsterData } from "./default-data.js";
import { getFS } from "./utils.js";
import { typeData } from "./type-data.js";

document.addEventListener("DOMContentLoaded", function () {
  // Init filesystem APIs (if available)
  getFS().then((fs) => {
    // Elements
    const movesTable = document.getElementById("moves-table");
    const importMovesBtn = document.getElementById("import-moves-btn");
    const movesFileInput = document.getElementById("moves-file-input");
    const exportMovesBtn = document.getElementById("export-moves-btn");
    const exportMovesJsBtn = document.getElementById("export-moves-js-btn");
    const addMoveBtn = document.getElementById("add-move-btn");

    let columns = monsterMovesData.columns;
    let data = [...monsterMovesData.data];

    // Event listeners
    importMovesBtn.addEventListener("click", () => movesFileInput.click());
    movesFileInput.addEventListener("change", handleFileImport);
    exportMovesBtn.addEventListener("click", exportToCsv);
    exportMovesJsBtn.addEventListener("click", exportToJs);
    addMoveBtn.addEventListener("click", addRow);

    // Initialize table
    renderMovesTable();

    // Functions
    function renderMovesTable() {
      const movesTableBody = movesTable.querySelector("tbody");
      movesTableBody.innerHTML = "";
      data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        columns.forEach((column) => {
          const td = document.createElement("td");
          td.dataset.row = rowIndex;
          td.dataset.column = column.name;

          if (column.name === "Mon") {
            // Create select dropdown
            const select = document.createElement("select");
            select.style.width = "100%";
            select.style.padding = "4px";
            select.style.backgroundColor = "transparent";
            select.style.border = "none";
            select.style.cursor = "pointer";
            select.style.color = "inherit";

            // Add empty option
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = "Select monster...";
            select.appendChild(emptyOption);

            // Add monster options from defaultMonsterData
            defaultMonsterData.data.forEach(monster => {
              if (monster.Name) {  // Only add if monster has a name
                const option = document.createElement("option");
                option.value = monster.Name;
                option.textContent = monster.Name;
                if (monster.Name === row[column.name]) {
                  option.selected = true;
                }
                select.appendChild(option);
              }
            });

            // Handle change event
            select.addEventListener("change", (e) => {
              data[rowIndex][column.name] = e.target.value;
            });

            // Add monster icon next to the select
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.alignItems = "center";
            container.style.gap = "8px";

            const img = document.createElement("img");
            const monsterName = (row[column.name] || "").toLowerCase();
            img.src = `imgs/${monsterName}_mini.gif`;
            img.alt = row[column.name] || "";
            img.style.width = "32x";
            img.style.imageRendering = "pixelated";
            img.onerror = () => img.style.display = "none";

            // Update image when selection changes
            select.addEventListener("change", (e) => {
              const newMonsterName = e.target.value.toLowerCase();
              img.src = `imgs/${newMonsterName}_mini.gif`;
              img.alt = e.target.value;
              img.style.display = ""; // Reset display in case it was hidden
            });

            container.appendChild(img);
            container.appendChild(select);
            td.appendChild(container);
          } else if (column.name === "Type") {
            // Create type dropdown
            const select = document.createElement("select");
            select.style.width = "100%";
            select.style.padding = "4px";
            select.style.backgroundColor = "transparent";
            select.style.border = "none";
            select.style.cursor = "pointer";
            select.style.color = "inherit"; // Add this line to inherit the td's text color

            // Add empty option
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = "Select type...";
            select.appendChild(emptyOption);

            // Add type options
            Object.entries(typeData).forEach(([type, info]) => {
              const option = document.createElement("option");
              option.value = type;
              option.textContent = `${info.emoji} ${type}`;
              option.style.backgroundColor = info.bgColor;
              option.style.color = info.textColor;
              if (type === row[column.name]) {
                option.selected = true;
                td.style.backgroundColor = info.bgColor;
                td.style.color = info.textColor;
                // Add these lines to set the select's colors to match the selected type
                select.style.backgroundColor = info.bgColor;
                select.style.color = info.textColor;
              }
              select.appendChild(option);
            });

            // Handle change event
            select.addEventListener("change", (e) => {
              const selectedType = e.target.value;
              const typeInfo = typeData[selectedType];
              
              // Update cell styling
              td.style.backgroundColor = selectedType ? typeInfo.bgColor : "";
              td.style.color = selectedType ? typeInfo.textColor : "";
              
              // Update data
              data[rowIndex][column.name] = selectedType;
            });

            td.appendChild(select);
          } else {
            if (column.editable) {
              td.contentEditable = true;
              td.className = "editable";

              if (column.type === "number") {
                td.textContent = row[column.name] || 0;
              } else {
                td.textContent = row[column.name] || "";
              }

              td.addEventListener("blur", updateData);
            } else {
              td.textContent = row[column.name] || "";
            }
          }

          tr.appendChild(td);
        });

        // Add delete button
        const actionsTd = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.backgroundColor = "#111";
        deleteBtn.addEventListener("click", () => deleteRow(rowIndex));
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        movesTableBody.appendChild(tr);
      });
    }

    function updateData(event) {
      const td = event.target;
      const rowIndex = parseInt(td.dataset.row);
      const column = td.dataset.column;
      const value = td.textContent.trim();

      if (columns.find(col => col.name === column)?.type === "number") {
        data[rowIndex][column] = parseFloat(value) || 0;
      } else {
        data[rowIndex][column] = value;
      }
    }

    function deleteRow(rowIndex) {
      data.splice(rowIndex, 1);
      renderMovesTable();
    }

    function addRow() {
      const newRow = {};
      
      columns.forEach((column) => {
        if (column.type === "number") {
          newRow[column.name] = 0;
        } else {
          newRow[column.name] = "";
        }
      });

      data.push(newRow);
      renderMovesTable();
    }

    function handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split("\n");
        
        if (lines.length < 2) return;

        // Extract headers
        const headers = lines[0].split(",").map(header => header.trim());

        // Reset columns
        columns = headers.map(header => ({
          name: header,
          type: ["Power", "Accuracy", "Stamina"].includes(header) ? "number" : "text",
          editable: true
        }));

        // Parse data
        data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(",");
          const rowData = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim() || "";
            rowData[header] = columns[index].type === "number" ? parseFloat(value) || 0 : value;
          });
          data.push(rowData);
        }

        renderMovesTable();
        movesFileInput.value = "";
      };
      reader.readAsText(file);
    }

    async function exportToCsv() {
      const headers = columns.map(col => col.name).join(",");
      const rows = data.map(row => {
        return columns.map(col => {
          let value = row[col.name] !== undefined ? row[col.name] : "";
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",");
      });

      const csvContent = [headers, ...rows].join("\n");

      try {
        await fs.writeTextFile("moves-export.csv", csvContent, {
          dir: fs.BaseDirectory.Runtime,
        });
      } catch (error) {
        // Web fallback
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "moves-export.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }

    async function exportToJs() {
      const jsContent = `export const monsterMovesData = {
  columns: ${JSON.stringify(columns, null, 2)},
  data: ${JSON.stringify(data, null, 2)}
};`;

      try {
        await fs.writeTextFile("default-moves.js", jsContent, {
          dir: fs.BaseDirectory.Runtime,
        });
      } catch (error) {
        // Web fallback
        const blob = new Blob([jsContent], { type: "application/javascript" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "default-moves.js";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  });
});