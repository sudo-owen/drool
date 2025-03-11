import { defaultMonsterData } from "./default-data.js";

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const dataTable = document.getElementById("data-table");
  const attackTable = document.getElementById("attack-table");
  const importBtn = document.getElementById("import-btn");
  const fileInput = document.getElementById("file-input");
  const addRowBtn = document.getElementById("add-row-btn");
  const calculateBtn = document.getElementById("calculate-btn");
  const exportBtn = document.getElementById("export-btn");
  const exportJsBtn = document.getElementById("export-js-btn");
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const showPhysCheckbox = document.getElementById("show-phys");
  const showSpecCheckbox = document.getElementById("show-spec");

  let columns = defaultMonsterData.columns;
  let data = [...defaultMonsterData.data];

  // Sort vars
  let columnToSort = undefined;
  let columnDirection = false;

  // Damage table sort vars
  let damageColumnToSort = undefined; // 'phys' or 'spec'
  let damageAttackerIndex = undefined; // index of the attacker column
  let damageDirection = false; // false for ascending, true for descending

  // Event listeners
  importBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileImport);
  addRowBtn.addEventListener("click", addRow);
  calculateBtn.addEventListener("click", calculateDamage);
  exportBtn.addEventListener("click", exportToCsv);
  exportJsBtn.addEventListener("click", exportToJs);
  showPhysCheckbox.addEventListener("change", updateDamageTableVisibility);
  showSpecCheckbox.addEventListener("change", updateDamageTableVisibility);

  // Tab navigation
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const tabContent = document.getElementById(tab.dataset.tab);
      tabContent.classList.add("active");
    });
  });

  // Initialize tables
  renderDataTable();
  calculateDamage(); // Add this line to calculate initial damage table

  // Functions
  function renderDataTable() {
    const tbody = dataTable.querySelector("tbody");
    tbody.innerHTML = "";

    // Update headers first
    updateTableHeaders();

    // Render data rows
    data.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");

      // Add image cell before other columns
      const imgTd = document.createElement("td");
      const img = document.createElement("img");
      const monsterName = (row.Name || "").toLowerCase();
      img.src = `imgs/${monsterName}_mini.gif`;
      img.alt = row.Name || "";
      img.onerror = () => (img.style.display = "none"); // Hide if image not found
      imgTd.appendChild(img);
      tr.appendChild(imgTd);

      columns.forEach((column) => {
        const td = document.createElement("td");

        // Always add data attributes regardless of editability
        td.dataset.row = rowIndex;
        td.dataset.column = column.name;

        if (column.editable) {
          td.contentEditable = true;
          td.className = "editable";

          if (column.type === "number") {
            td.textContent = row[column.name] || 0;
            td.addEventListener("input", validateNumberInput);
          } else {
            td.textContent = row[column.name] || "";
          }

          td.addEventListener("blur", updateData);
        } else {
          td.textContent = row[column.name] || "";
        }

        tr.appendChild(td);
      });

      // Add action buttons
      const actionsTd = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.backgroundColor = "#f44336";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this row?")) {
          deleteRow(rowIndex);
        }
      });

      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });

    updateStatsHeatmap();
    updateMonsterSelect();
  }

  function updateTableHeaders() {
    const headerRow = dataTable.querySelector("thead tr");
    headerRow.innerHTML = "";

    // Add image column header
    const imgHeader = document.createElement("th");
    imgHeader.textContent = "Icon";
    headerRow.appendChild(imgHeader);

    columns.forEach((column) => {
      const th = document.createElement("th");
      th.className = "column-header";

      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.alignItems = "center";
      headerContent.style.gap = "5px";

      const headerText = document.createElement("span");
      headerText.textContent = column.name;
      headerContent.appendChild(headerText);

      if (column.type === "number") {
        const sortIndicator = document.createElement("span");
        sortIndicator.className = "sort-indicator";
        sortIndicator.innerHTML = "";

        headerContent.addEventListener("click", () => {
          if (columnToSort === column.name && columnDirection === true) {
            columnToSort = column.name;
            columnDirection = false;
            sortData(columnToSort, false);
          } else {
            columnToSort = column.name;
            columnDirection = true;
            sortData(columnToSort, true);
          }
        });

        headerContent.appendChild(sortIndicator);
      }

      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });

    const actionsHeader = document.createElement("th");
    actionsHeader.textContent = "Actions";
    headerRow.appendChild(actionsHeader);
  }

  function validateNumberInput(event) {
    const value = event.target.textContent;

    if (value !== "" && isNaN(parseFloat(value))) {
      event.target.classList.add("error");
    } else {
      event.target.classList.remove("error");
    }
  }

  function updateData(event) {
    const cell = event.target;
    const rowIndex = parseInt(cell.dataset.row);
    const columnName = cell.dataset.column;
    const value = cell.textContent.trim();

    if (!isNaN(rowIndex) && columnName) {
      const column = columns.find((col) => col.name === columnName);

      if (column.type === "number") {
        if (value === "" || isNaN(parseFloat(value))) {
          data[rowIndex][columnName] = 0;
          cell.textContent = "0";
        } else {
          data[rowIndex][columnName] = parseFloat(value);
        }

        // Update BST after changing a numeric value
        updateBST(rowIndex);

        // Recalculate damage if we have all required stats
        if (hasRequiredColumns()) {
          calculateDamage();
        }
      } else {
        data[rowIndex][columnName] = value;
      }
    }
  }

  function hasRequiredColumns() {
    const requiredColumns = [
      "HP",
      "Attack",
      "Defense",
      "SpecialAttack",
      "SpecialDefense",
    ];
    return requiredColumns.every((col) => columns.some((c) => c.name === col));
  }

  function updateBST(rowIndex) {
    const statsToSum = [
      "HP",
      "Attack",
      "Defense",
      "SpecialAttack",
      "SpecialDefense",
      "Speed",
    ];
    let bst = 0;

    statsToSum.forEach((stat) => {
      if (data[rowIndex][stat] !== undefined) {
        bst += parseFloat(data[rowIndex][stat]) || 0;
      }
    });

    data[rowIndex]["BST"] = bst;

    // Update BST cell in the table if it exists
    const bstCell = document.querySelector(
      `td[data-row="${rowIndex}"][data-column="BST"]`
    );
    if (bstCell) {
      bstCell.textContent = bst;
    }
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
    updateBST(data.length - 1);
    renderDataTable();

    // Calculate damage if we have all required columns
    if (hasRequiredColumns()) {
      calculateDamage();
    }
  }

  function deleteRow(rowIndex) {
    data.splice(rowIndex, 1);
    renderDataTable();
  }

  function calculateDamage() {
    // Make sure we have the required columns for calculations
    const requiredColumns = [
      "HP",
      "Attack",
      "Defense",
      "SpecialAttack",
      "SpecialDefense",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !columns.some((c) => c.name === col)
    );

    if (missingColumns.length > 0) {
      return;
    }

    updateMonsterSelect();
    renderCombinedDamageTable();
  }

  function renderCombinedDamageTable() {
    attackTable.innerHTML = "";

    // Create header row with "Atk ↓ / Def →" in corner
    const headerRow = document.createElement("tr");
    const cornerCell = document.createElement("th");
    cornerCell.textContent = "Atk ↓ / Def →";
    headerRow.appendChild(cornerCell);

    // Create headers for each defender (columns)
    data.forEach((defenderRow) => {
      const th = document.createElement("th");
      th.colSpan = "2"; // Span both physical and special cells

      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.flexDirection = "column";
      headerContent.style.alignItems = "center";
      headerContent.style.gap = "4px";

      const img = document.createElement("img");
      const monsterName = (defenderRow.Name || "").toLowerCase();
      img.src = `imgs/${monsterName}_mini.gif`;
      img.alt = defenderRow.Name || "";
      img.onerror = () => (img.style.display = "none");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = `🛡️ ${defenderRow.Name || "Unknown"}`;

      headerContent.appendChild(img);
      headerContent.appendChild(nameSpan);
      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });

    attackTable.appendChild(headerRow);

    // Create subheader for Phys/Spec labels
    const subheaderRow = document.createElement("tr");
    const emptyCorner = document.createElement("th");
    subheaderRow.appendChild(emptyCorner);

    data.forEach((_, columnIndex) => {
      const physHeader = document.createElement("th");
      physHeader.textContent = "Phys";
      physHeader.style.fontSize = "0.8em";
      physHeader.style.cursor = "pointer";

      const specHeader = document.createElement("th");
      specHeader.textContent = "Spec";
      specHeader.style.fontSize = "0.8em";
      specHeader.style.cursor = "pointer";

      // Add click handlers for sorting
      physHeader.addEventListener("click", () => {
        if (
          damageColumnToSort === "phys" &&
          damageAttackerIndex === columnIndex &&
          damageDirection === true
        ) {
          damageDirection = false;
        } else {
          damageDirection = true;
        }
        damageColumnToSort = "phys";
        damageAttackerIndex = columnIndex;
        sortDamageTable();
      });

      specHeader.addEventListener("click", () => {
        if (
          damageColumnToSort === "spec" &&
          damageAttackerIndex === columnIndex &&
          damageDirection === true
        ) {
          damageDirection = false;
        } else {
          damageDirection = true;
        }
        damageColumnToSort = "spec";
        damageAttackerIndex = columnIndex;
        sortDamageTable();
      });

      subheaderRow.appendChild(physHeader);
      subheaderRow.appendChild(specHeader);
    });

    attackTable.appendChild(subheaderRow);

    // Get min/max values for color scaling
    const allDamageValues = [];
    data.forEach((attackerRow) => {
      data.forEach((defenderRow) => {
        const physDamage =
          defenderRow.HP / (attackerRow.Attack / defenderRow.Defense);
        const specDamage =
          defenderRow.HP /
          (attackerRow.SpecialAttack / defenderRow.SpecialDefense);
        allDamageValues.push(physDamage, specDamage);
      });
    });

    const minDamage = Math.min(...allDamageValues);
    const maxDamage = Math.max(...allDamageValues);

    // Create data rows (now attackers)
    data.forEach((attackerRow) => {
      const tr = document.createElement("tr");

      // Row header with image and name
      const rowHeader = document.createElement("th");
      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.alignItems = "center";
      headerContent.style.gap = "8px";

      const img = document.createElement("img");
      const monsterName = (attackerRow.Name || "").toLowerCase();
      img.src = `imgs/${monsterName}_mini.gif`;
      img.alt = attackerRow.Name || "";
      img.onerror = () => (img.style.display = "none");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = `⚔️ ${attackerRow.Name || "Unknown"}`;

      headerContent.appendChild(img);
      headerContent.appendChild(nameSpan);
      rowHeader.appendChild(headerContent);
      tr.appendChild(rowHeader);

      // Calculate damage cells for each defender
      data.forEach((defenderRow) => {
        // Physical damage cell
        const physTd = document.createElement("td");
        const physDamage =
          defenderRow.HP / (attackerRow.Attack / defenderRow.Defense);
        physTd.textContent = physDamage.toFixed(1);

        // Special damage cell
        const specTd = document.createElement("td");
        const specDamage =
          defenderRow.HP /
          (attackerRow.SpecialAttack / defenderRow.SpecialDefense);
        specTd.textContent = specDamage.toFixed(1);

        // Add color scaling
        const getColorIntensity = (value) => {
          const normalized = (value - minDamage) / (maxDamage - minDamage);
          return Math.floor((1 - normalized) * 40);
        };

        physTd.style.backgroundColor = `rgba(255, 99, 71, ${getColorIntensity(
          physDamage
        )}%)`;
        specTd.style.backgroundColor = `rgba(65, 105, 225, ${getColorIntensity(
          specDamage
        )}%)`;

        tr.appendChild(physTd);
        tr.appendChild(specTd);
      });

      attackTable.appendChild(tr);
    });

    // Add some styling to the table
    attackTable.style.borderCollapse = "collapse";
    const cells = attackTable.getElementsByTagName("td");
    for (let cell of cells) {
      cell.style.padding = "4px 8px";
      cell.style.border = "1px solid #ddd";
      cell.style.textAlign = "center";
    }

    updateDamageTableVisibility();
  }

  function handleFileImport(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target.result;
        parseCSV(content);
      };

      reader.readAsText(file);
    }
  }

  function parseCSV(csvContent) {
    const lines = csvContent.split(/\r\n|\n/);

    if (lines.length < 2) {
      return;
    }

    // Extract headers
    const headers = lines[0].split(",").map((header) => header.trim());

    // Reset columns
    columns = [];
    headers.forEach((header) => {
      // Try to determine if it's likely a number column
      const isLikelyNumber = [
        "hp",
        "attack",
        "defense",
        "specialattack",
        "specialdefense",
        "speed",
        "bst",
      ].includes(header.toLowerCase());

      columns.push({
        name: header,
        type: isLikelyNumber ? "number" : "text",
        editable: header.toLowerCase() !== "bst", // Make BST non-editable
      });
    });

    // Add BST column if it doesn't exist
    if (!headers.some((h) => h.toLowerCase() === "bst")) {
      columns.push({
        name: "BST",
        type: "number",
        editable: false,
      });
    }

    // Parse data rows
    data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = lines[i].split(",").map((value) => value.trim());
      const rowData = {};

      headers.forEach((header, index) => {
        const value = values[index] || "";

        if (columns[index].type === "number") {
          rowData[header] = value !== "" ? parseFloat(value) : 0;
        } else {
          rowData[header] = value;
        }
      });

      data.push(rowData);
    }

    // Update BST for all rows
    data.forEach((_, index) => updateBST(index));

    renderDataTable();

    // Calculate damage if we have all required columns
    if (hasRequiredColumns()) {
      calculateDamage();
    }

    fileInput.value = "";
  }

  async function exportToCsv() {
    if (data.length === 0) {
      return;
    }

    const headers = columns.map((col) => col.name).join(",");
    const rows = data.map((row) => {
      return columns
        .map((col) => {
          let value = row[col.name] !== undefined ? row[col.name] : "";

          // Handle special characters
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
          ) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    try {
    } catch (error) {
      console.error("Failed to save CSV file:", error);
    }
  }

  async function exportToJs() {
    if (data.length === 0) {
      return;
    }

    const jsContent = `const defaultMonsterData = {
  columns: ${JSON.stringify(columns, null, 2)},
  data: ${JSON.stringify(data, null, 2)}
};`;

    try {
    } catch (error) {
      console.error("Failed to save JS file:", error);
    }
  }

  function applyCellHeatmap(cell, value, minValue, maxValue) {
    const normalized = (value - minValue) / (maxValue - minValue);
    const intensity = Math.floor(normalized * 40); // Using 40 for very light colors
    cell.style.backgroundColor = `rgba(65, 105, 225, ${intensity}%)`;
  }

  function updateStatsHeatmap() {
    // Get all numeric columns except BST
    const numericColumns = columns.filter(
      (col) => col.type === "number" && col.name !== "BST"
    );

    // Calculate min/max for each column
    numericColumns.forEach((column) => {
      const values = data.map((row) => parseFloat(row[column.name]) || 0);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      // Apply heatmap to each cell in the column
      data.forEach((_, rowIndex) => {
        const cell = document.querySelector(
          `td[data-row="${rowIndex}"][data-column="${column.name}"]`
        );
        if (cell) {
          const value = parseFloat(cell.textContent) || 0;
          applyCellHeatmap(cell, value, minValue, maxValue);
        }
      });
    });
  }

  function sortData(columnName, ascending = true) {
    data.sort((a, b) => {
      const aValue = a[columnName];
      const bValue = b[columnName];

      if (columns.find((col) => col.name === columnName).type === "number") {
        return ascending
          ? (parseFloat(aValue) || 0) - (parseFloat(bValue) || 0)
          : (parseFloat(bValue) || 0) - (parseFloat(aValue) || 0);
      } else {
        return ascending
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

    renderDataTable();
    updateStatsHeatmap();
  }

  function sortDamageTable() {
    // Store the current table structure
    const currentRows = Array.from(attackTable.querySelectorAll("tr")).slice(2); // Skip header and subheader rows

    // Create array of objects containing defender data and damage values
    const sortableData = currentRows.map((row) => {
      // Remove the emoji from the name to find the correct data
      const defenderName = row
        .querySelector("th span")
        .textContent.replace("⚔️ ", "");
      const defenderData = data.find((d) => d.Name === defenderName);
      const attackerRow = data[damageAttackerIndex];

      // Make sure we have valid data before calculating
      if (!defenderData || !attackerRow)
        return { row, physDamage: Infinity, specDamage: Infinity };

      const physDamage =
        defenderData.HP / (attackerRow.Attack / defenderData.Defense);
      const specDamage =
        defenderData.HP /
        (attackerRow.SpecialAttack / defenderData.SpecialDefense);

      return {
        row,
        physDamage,
        specDamage,
      };
    });

    // Sort the rows
    sortableData.sort((a, b) => {
      const valueA =
        damageColumnToSort === "phys" ? a.physDamage : a.specDamage;
      const valueB =
        damageColumnToSort === "phys" ? b.physDamage : b.specDamage;

      return damageDirection ? valueB - valueA : valueA - valueB;
    });

    // Remove existing rows (except headers)
    currentRows.forEach((row) => row.remove());

    // Append sorted rows back to the table
    sortableData.forEach((item) => {
      attackTable.appendChild(item.row);
    });
  }

  function updateDamageTableVisibility() {
    const showPhys = showPhysCheckbox.checked;
    const showSpec = showSpecCheckbox.checked;

    // Update column headers
    const headerCells = attackTable.querySelectorAll("tr:nth-child(1) th");
    const subheaderCells = attackTable.querySelectorAll("tr:nth-child(2) th");

    // Skip first cell (corner cell)
    for (let i = 1; i < headerCells.length; i++) {
      headerCells[i].colSpan = showPhys && showSpec ? "2" : "1";
      if (!showPhys && !showSpec) {
        headerCells[i].style.display = "none";
      } else {
        headerCells[i].style.display = "";
      }
    }

    // Handle subheader and data cells
    const rows = attackTable.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      if (rowIndex < 2) return; // Skip header rows

      const cells = row.querySelectorAll("td");
      cells.forEach((cell, cellIndex) => {
        if (cellIndex % 2 === 0) {
          // Physical damage cells
          cell.style.display = showPhys ? "" : "none";
        } else {
          // Special damage cells
          cell.style.display = showSpec ? "" : "none";
        }
      });
    });

    // Handle subheader cells (Phys/Spec labels)
    for (let i = 1; i < subheaderCells.length; i++) {
      if (i % 2 === 1) {
        // Physical headers
        subheaderCells[i].style.display = showPhys ? "" : "none";
      } else {
        // Special headers
        subheaderCells[i].style.display = showSpec ? "" : "none";
      }
    }
  }

  function updateMonsterSelect() {
    const select = document.getElementById("monster-select");
    select.innerHTML = '<option value="">Select a mon</option>';

    data.forEach((monster, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = monster.Name || "Unknown";
      select.appendChild(option);
    });
  }

  function calculateMonsterAnalysis(monsterIndex) {
    const defender = data[monsterIndex];
    const results = {
      physical: [],
      special: [],
    };

    // Calculate all damage values
    data.forEach((attacker) => {
      const physDamage = defender.HP / (attacker.Attack / defender.Defense);
      const specDamage =
        defender.HP / (attacker.SpecialAttack / defender.SpecialDefense);

      results.physical.push({
        damage: physDamage,
        attacker: attacker.Name,
      });
      results.special.push({
        damage: specDamage,
        attacker: attacker.Name,
      });
    });

    // Sort arrays for finding min and median
    results.physical.sort((a, b) => a.damage - b.damage);
    results.special.sort((a, b) => a.damage - b.damage);

    // Calculate statistics
    const stats = {
      lowestOverall: {
        damage: Math.min(results.physical[0].damage, results.special[0].damage),
        attacker:
          results.physical[0].damage < results.special[0].damage
            ? results.physical[0].attacker
            : results.special[0].attacker,
        category:
          results.physical[0].damage < results.special[0].damage
            ? "Physical"
            : "Special",
      },
      physical: {
        min: results.physical[0],
        avg:
          results.physical.reduce((sum, val) => sum + val.damage, 0) /
          results.physical.length,
        median:
          results.physical[Math.floor(results.physical.length / 2)].damage,
      },
      special: {
        min: results.special[0],
        avg:
          results.special.reduce((sum, val) => sum + val.damage, 0) /
          results.special.length,
        median: results.special[Math.floor(results.special.length / 2)].damage,
      },
    };

    displayAnalysisResults(stats, defender.Name);
  }

  function displayAnalysisResults(stats, monsterName) {
    const resultsDiv = document.getElementById("analysis-results");
    const monsterNameLower = monsterName.toLowerCase();

    resultsDiv.innerHTML = `
        <div class="analysis-header">
          <img src="imgs/${monsterNameLower}_mini.gif" alt="${monsterName}" 
               onerror="this.style.display='none'">
          <h3>Analysis for ${monsterName}</h3>
        </div>
        <div class="analysis-grid">
          <div class="analysis-item">
            <h4>Lowest Damage to KO</h4>
            <p>${stats.lowestOverall.damage.toFixed(1)} (${
      stats.lowestOverall.category
    } from ${stats.lowestOverall.attacker})</p>
          </div>
          
          <div class="analysis-item">
            <h4>Physical Damage Analysis</h4>
            <p>Minimum: ${stats.physical.min.damage.toFixed(1)} (from ${
      stats.physical.min.attacker
    })</p>
            <p>Average: ${stats.physical.avg.toFixed(1)}</p>
            <p>Median: ${stats.physical.median.toFixed(1)}</p>
          </div>
          
          <div class="analysis-item">
            <h4>Special Damage Analysis</h4>
            <p>Minimum: ${stats.special.min.damage.toFixed(1)} (from ${
      stats.special.min.attacker
    })</p>
            <p>Average: ${stats.special.avg.toFixed(1)}</p>
            <p>Median: ${stats.special.median.toFixed(1)}</p>
          </div>
        </div>
      `;
  }

  document.getElementById("monster-select").addEventListener("change", (e) => {
    if (e.target.value !== "") {
      calculateMonsterAnalysis(parseInt(e.target.value));
    } else {
      document.getElementById("analysis-results").innerHTML = "";
    }
  });
});
