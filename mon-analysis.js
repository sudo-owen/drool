document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const attackTable = document.getElementById("attack-table");
  const showPhysCheckbox = document.getElementById("show-phys");
  const showSpecCheckbox = document.getElementById("show-spec");
  const monsterSelect = document.getElementById("monster-select");
  
  // Variables for damage table
  let data = []; // Will be populated from mon-stats.js
  let columns = []; // Will be populated from mon-stats.js
  let damageColumnToSort = undefined; // 'phys' or 'spec'
  let damageAttackerIndex = undefined; // index of the attacker column
  let damageDirection = false; // false for ascending, true for descending
  
  // Event listeners
  showPhysCheckbox.addEventListener("change", updateDamageTableVisibility);
  showSpecCheckbox.addEventListener("change", updateDamageTableVisibility);
  monsterSelect.addEventListener("change", (e) => {
    if (e.target.value !== "") {
      calculateMonsterAnalysis(parseInt(e.target.value));
    } else {
      document.getElementById("analysis-results").innerHTML = "";
    }
  });
  
  // Listen for data updates from mon-stats.js
  document.addEventListener("monster-data-updated", function(event) {
    data = event.detail.data;
    columns = event.detail.columns;
    updateMonsterSelect();
    renderCombinedDamageTable();
  });

  // Functions moved from mon-stats.js
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

  function sortDamageTable() {
    // Store the current table structure
    const currentRows = Array.from(attackTable.querySelectorAll("tr")).slice(
      2
    ); // Skip header and subheader rows

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
        damage: Math.min(
          results.physical[0].damage,
          results.special[0].damage
        ),
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
        median:
          results.special[Math.floor(results.special.length / 2)].damage,
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

  // Check if we need to initialize with existing data
  // This is for when the page loads and mon-stats.js has already loaded data
  if (window.monsterData && window.monsterData.data && window.monsterData.columns) {
    data = window.monsterData.data;
    columns = window.monsterData.columns;
    updateMonsterSelect();
    renderCombinedDamageTable();
  }
});
