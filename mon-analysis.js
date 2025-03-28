import { loadFullMonsFromCsv, loadMovesFromCsv, loadAbilitiesFromCsv, loadTypeData } from "./utils.js";
import { typeData } from "./type-data.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Elements
  const attackTable = document.getElementById("attack-table");
  const maxDamageTable = document.getElementById("max-damage-table");
  const showPhysCheckbox = document.getElementById("show-phys");
  const showSpecCheckbox = document.getElementById("show-spec");
  const transposeTableCheckbox = document.getElementById("transpose-table");
  const monsterSelect = document.getElementById("monster-select");
  const toggleDamageToKoBtn = document.getElementById("toggle-damage-to-ko");
  const damageToKoContainer = document.querySelector(".damage-to-ko-container");

  // Variables for damage table
  let data = [];
  let columns = [];
  let damageColumnToSort = undefined; // 'phys' or 'spec'
  let damageAttackerIndex = undefined; // index of the attacker column
  let damageDirection = false; // false for ascending, true for descending
  let isTransposed = false; // for max damage table view

  // Variables for max damage table sorting
  let maxDamageColumnToSort = undefined; // index of the column to sort by
  let maxDamageDirection = false; // false for ascending, true for descending

  // Variables for move damage calculation
  let movesData = await loadMovesFromCsv();
  let typeEffectivenessData = await loadTypeData();

  // Event listeners
  showPhysCheckbox.addEventListener("change", updateDamageTableVisibility);
  showSpecCheckbox.addEventListener("change", updateDamageTableVisibility);
  transposeTableCheckbox.addEventListener("change", function() {
    isTransposed = this.checked;
    document.getElementById("view-perspective").textContent =
      isTransposed ? "(Defender View)" : "(Attacker View)";
    renderMaxDamageTable();
  });
  monsterSelect.addEventListener("change", (e) => {
    if (e.target.value !== "") {
      calculateMonsterAnalysis(parseInt(e.target.value));
    } else {
      document.getElementById("analysis-results").innerHTML = "";
    }
  });

  // Toggle Damage to KO table visibility
  toggleDamageToKoBtn.addEventListener("click", function() {
    const isVisible = damageToKoContainer.style.display !== "none";
    damageToKoContainer.style.display = isVisible ? "none" : "block";
    toggleDamageToKoBtn.textContent = isVisible ? "Show Damage to KO Table" : "Hide Damage to KO Table";
  });

  // Listen for data updates from mon-stats.js
  document.addEventListener("monster-data-updated", function(event) {
    data = event.detail.data;
    columns = event.detail.columns;
    updateMonsterSelect();
    renderCombinedDamageTable();
    renderMaxDamageTable();

    // Make sure the Damage to KO table is hidden by default
    damageToKoContainer.style.display = "none";
    toggleDamageToKoBtn.textContent = "Show Damage to KO Table";
  });

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

  function calculateMonsterAnalysis(monsterIndex) {
    const defender = data[monsterIndex];
    const results = {
      physical: [],
      special: [],
      moveDamage: []
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

      // Calculate damage for each of the attacker's moves against the defender
      const attackerMoves = getMovesForMonster(attacker.Name);
      if (attackerMoves.length > 0) {
        attackerMoves.forEach(move => {
          const moveDamage = calculateMoveDamage(move, attacker, defender);
          if (moveDamage) {
            results.moveDamage.push({
              ...moveDamage,
              attacker: attacker.Name
            });
          }
        });
      }
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
      moveDamage: results.moveDamage
    };

    displayAnalysisResults(stats, defender.Name);
  }

  // Function to get type effectiveness multiplier
  function getTypeEffectiveness(attackerType, defenderType1, defenderType2) {
    let type1Multiplier = typeEffectivenessData[attackerType][defenderType1];
    if (type1Multiplier == 5) {
      type1Multiplier = 0.5;
    }
    let type2Multiplier = defenderType2 === 'NA' ? 1 : typeEffectivenessData[attackerType][defenderType2];
    if (type2Multiplier == 5) {
      type2Multiplier = 0.5;
    }
    return type1Multiplier * type2Multiplier;
  }

  // Function to calculate damage for a move
  function calculateMoveDamage(move, attacker, defender) {
    // Skip if move has no power or power is '?'
    if (!move.Power || move.Power === '?' || move.Power === 0) {
      return null;
    }

    // Determine if physical or special move
    const isPhysical = move.Class === 'Physical';
    const isSpecial = move.Class === 'Special';

    // Skip if not a damaging move
    if (!isPhysical && !isSpecial) {
      return null;
    }

    // Get the relevant attack and defense stats
    const attackStat = isPhysical ? attacker.Attack : attacker.SpecialAttack;
    const defenseStat = isPhysical ? defender.Defense : defender.SpecialDefense;
    const attackStatName = isPhysical ? 'Attack' : 'Sp.Atk';
    const defenseStatName = isPhysical ? 'Defense' : 'Sp.Def';

    // Calculate base damage
    let baseDamage = (move.Power * attackStat) / defenseStat;

    // Apply type effectiveness
    const typeMultiplier = getTypeEffectiveness(move.Type, defender.Type1, defender.Type2);
    const damage = baseDamage * typeMultiplier;

    return {
      damage,
      baseDamage,
      moveName: move.Name,
      moveType: move.Type,
      moveClass: move.Class,
      typeMultiplier,
      power: move.Power,
      percentHp: (damage / defender.HP) * 100,
      attackStat,
      defenseStat,
      attackStatName,
      defenseStatName
    };
  }

  // Function to get all moves for a monster
  function getMovesForMonster(monsterName) {
    return movesData.filter(move => move.Mon === monsterName);
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

    // Add move damage section if we have move data
    if (stats.moveDamage && stats.moveDamage.length > 0) {
      const moveDamageSection = document.createElement('div');
      moveDamageSection.className = 'analysis-item move-damage-section';
      moveDamageSection.innerHTML = `<h4>Move Damage Analysis</h4>`;

      // Create a table for move damage
      const moveTable = document.createElement('table');
      moveTable.className = 'move-damage-table';
      moveTable.innerHTML = `
        <thead>
          <tr>
            <th>Move</th>
            <th>Type</th>
            <th>From</th>
            <th>Calculation</th>
            <th>Damage</th>
            <th>% HP</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      // Sort moves by damage (highest first)
      stats.moveDamage.sort((a, b) => b.damage - a.damage);

      // Add rows for each move
      stats.moveDamage.forEach(move => {
        const row = document.createElement('tr');

        // Format effectiveness text
        let effectivenessText = '1x (Neutral)';
        if (move.typeMultiplier === 0) effectivenessText = 'Immune (0x)';
        else if (move.typeMultiplier === 0.25) effectivenessText = 'Not very effective (0.25x)';
        else if (move.typeMultiplier === 0.5) effectivenessText = 'Not very effective (0.5x)';
        else if (move.typeMultiplier === 2) effectivenessText = 'Super effective (2x)';
        else if (move.typeMultiplier === 4) effectivenessText = 'Super effective (4x)';

        // Get type color
        const typeInfo = typeData[move.moveType] || { bgColor: '#333', textColor: '#fff', emoji: '' };

        // Create calculation formula
        const calculationHtml = `
          <span class="calculation-formula">
            (${move.power} Power × ${move.attackStat} ${move.attackStatName}) ÷ ${move.defenseStat} ${move.defenseStatName} × ${move.typeMultiplier}
          </span>
          <div class="calculation-steps">
            = ${move.damage.toFixed(1)}
          </div>
        `;

        row.innerHTML = `
          <td>${move.moveName}</td>
          <td style="background-color: ${typeInfo.bgColor}; color: ${typeInfo.textColor}">
            ${typeInfo.emoji} ${move.moveType}
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <img src="imgs/${move.attacker.toLowerCase()}_mini.gif" alt="${move.attacker}"
                   style="width: 32px; image-rendering: pixelated;" onerror="this.style.display='none'">
              <span>${move.attacker}</span>
            </div>
          </td>
          <td>${calculationHtml}</td>
          <td>${move.damage.toFixed(1)}</td>
          <td>${move.percentHp.toFixed(1)}%</td>
        `;

        moveTable.querySelector('tbody').appendChild(row);
      });

      moveDamageSection.appendChild(moveTable);
      resultsDiv.querySelector('.analysis-grid').appendChild(moveDamageSection);
    }
  }

  // Function to calculate the greatest %HP damage each monster can deal to every other monster
  function calculateMaxDamage() {
    const maxDamageData = [];

    // For each attacker
    data.forEach((attacker) => {
      const attackerData = {
        name: attacker.Name,
        damages: []
      };

      // For each defender
      data.forEach((defender) => {
        // Calculate physical and special damage
        const physDamage = defender.HP / (attacker.Attack / defender.Defense);
        const specDamage = defender.HP / (attacker.SpecialAttack / defender.SpecialDefense);

        // Calculate move damage if available
        let maxMoveDamage = 0;
        let maxMoveName = "";
        let maxMoveClass = "";
        const attackerMoves = getMovesForMonster(attacker.Name);

        if (attackerMoves.length > 0) {
          attackerMoves.forEach(move => {
            const moveDamage = calculateMoveDamage(move, attacker, defender);
            if (moveDamage && moveDamage.percentHp > maxMoveDamage) {
              maxMoveDamage = moveDamage.percentHp;
              maxMoveName = move.Name;
              maxMoveClass = move.Class;
            }
          });
        }

        // Determine the greatest damage (as percentage of HP)
        // The damage values are 'damage to KO', so we need to invert them to get %HP damage
        const physPercentHp = (100 / physDamage) * 100;
        const specPercentHp = (100 / specDamage) * 100;

        let greatestDamage = Math.max(physPercentHp, specPercentHp, maxMoveDamage);
        let damageSource = "";

        damageSource = `${maxMoveName} (${maxMoveClass})`;

        attackerData.damages.push({
          defenderName: defender.Name,
          percentHp: greatestDamage,
          source: damageSource
        });
      });

      maxDamageData.push(attackerData);
    });

    return maxDamageData;
  }

  // Function to sort the max damage table
  function sortMaxDamageTable(columnIndex) {
    // Toggle direction if clicking the same column
    if (maxDamageColumnToSort === columnIndex) {
      maxDamageDirection = !maxDamageDirection;
    } else {
      maxDamageColumnToSort = columnIndex;
      maxDamageDirection = true; // Default to descending (highest damage first)
    }

    // Re-render the table with the new sorting
    renderMaxDamageTable();
  }

  // Function to render the max damage table
  function renderMaxDamageTable() {
    if (!data || data.length === 0) return;

    maxDamageTable.innerHTML = "";

    // Calculate max damage data
    const maxDamageData = calculateMaxDamage();

    // Create header row
    const headerRow = document.createElement("tr");
    const cornerCell = document.createElement("th");
    cornerCell.textContent = isTransposed ? "Def ↓ / Atk →" : "Atk ↓ / Def →";
    headerRow.appendChild(cornerCell);

    // Create headers for each monster (columns)
    const columnMonsters = isTransposed ? maxDamageData : data;
    columnMonsters.forEach((monster, colIndex) => {
      const th = document.createElement("th");
      th.style.cursor = "pointer";

      // Add click handler for sorting
      th.addEventListener("click", () => {
        sortMaxDamageTable(colIndex);
      });

      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.flexDirection = "column";
      headerContent.style.alignItems = "center";
      headerContent.style.gap = "4px";

      const img = document.createElement("img");
      const monsterName = isTransposed ? monster.name.toLowerCase() : monster.Name.toLowerCase();
      img.src = `imgs/${monsterName}_mini.gif`;
      img.alt = isTransposed ? monster.name : monster.Name;
      img.onerror = () => (img.style.display = "none");

      const nameSpan = document.createElement("span");
      let nameText = isTransposed
        ? `⚔️ ${monster.name}`
        : `🛡️ ${monster.Name}`;

      // Add sort indicator if this is the sorted column
      if (maxDamageColumnToSort === colIndex) {
        nameText += maxDamageDirection ? " \u25BC" : " \u25B2";
      }

      nameSpan.textContent = nameText;

      headerContent.appendChild(img);
      headerContent.appendChild(nameSpan);
      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });

    maxDamageTable.appendChild(headerRow);

    // Get min/max values for color scaling
    const allDamageValues = [];
    maxDamageData.forEach(attacker => {
      attacker.damages.forEach(damage => {
        allDamageValues.push(damage.percentHp);
      });
    });

    const minDamage = Math.min(...allDamageValues);
    const maxDamage = Math.max(...allDamageValues);

    // Create data rows
    let rowMonsters = isTransposed ? data : maxDamageData;

    // Sort the rows if a column is selected for sorting
    if (maxDamageColumnToSort !== undefined) {
      rowMonsters = [...rowMonsters].sort((a, b) => {
        let valueA, valueB;

        if (isTransposed) {
          // When transposed, we need to find the damage from the specific attacker
          const attackerName = maxDamageData[maxDamageColumnToSort].name;
          const damageToA = maxDamageData.find(d => d.name === attackerName)
            .damages.find(d => d.defenderName === a.Name);
          const damageToB = maxDamageData.find(d => d.name === attackerName)
            .damages.find(d => d.defenderName === b.Name);

          valueA = damageToA ? damageToA.percentHp : 0;
          valueB = damageToB ? damageToB.percentHp : 0;
        } else {
          // Normal view - just get the damage to the specific defender
          valueA = a.damages[maxDamageColumnToSort].percentHp;
          valueB = b.damages[maxDamageColumnToSort].percentHp;
        }

        return maxDamageDirection ? valueB - valueA : valueA - valueB;
      });
    }

    rowMonsters.forEach((rowMonster, rowIndex) => {
      const tr = document.createElement("tr");

      // Row header with image and name
      const rowHeader = document.createElement("th");
      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.alignItems = "center";
      headerContent.style.gap = "8px";

      const img = document.createElement("img");
      const monsterName = isTransposed
        ? rowMonster.Name.toLowerCase()
        : rowMonster.name.toLowerCase();
      img.src = `imgs/${monsterName}_mini.gif`;
      img.alt = isTransposed ? rowMonster.Name : rowMonster.name;
      img.onerror = () => (img.style.display = "none");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = isTransposed
        ? `🛡️ ${rowMonster.Name}`
        : `⚔️ ${rowMonster.name}`;

      headerContent.appendChild(img);
      headerContent.appendChild(nameSpan);
      rowHeader.appendChild(headerContent);
      tr.appendChild(rowHeader);

      // Create cells for each column
      if (isTransposed) {
        // Transposed view: rows are defenders, columns are attackers
        maxDamageData.forEach((attacker) => {
          const damageInfo = attacker.damages.find(d => d.defenderName === rowMonster.Name);
          if (damageInfo) {
            const td = document.createElement("td");
            // Create a structured display for the damage info
            const damageValue = document.createElement("div");
            damageValue.style.fontWeight = "bold";
            damageValue.textContent = `${damageInfo.percentHp.toFixed(1)}%`;

            const sourceInfo = document.createElement("div");
            sourceInfo.style.fontSize = "0.85em";
            sourceInfo.style.color = "#aaa";
            sourceInfo.textContent = damageInfo.source;

            td.appendChild(damageValue);
            td.appendChild(sourceInfo);

            // Add color scaling
            const getColorIntensity = (value) => {
              const normalized = (value - minDamage) / (maxDamage - minDamage);
              return Math.floor(normalized * 40);
            };

            td.style.backgroundColor = `rgba(255, 99, 71, ${getColorIntensity(damageInfo.percentHp)}%)`;
            tr.appendChild(td);
          } else {
            const td = document.createElement("td");
            td.textContent = "N/A";
            tr.appendChild(td);
          }
        });
      } else {
        // Normal view: rows are attackers, columns are defenders
        rowMonster.damages.forEach((damageInfo) => {
          const td = document.createElement("td");
          // Create a structured display for the damage info
          const damageValue = document.createElement("div");
          damageValue.style.fontWeight = "bold";
          damageValue.textContent = `${damageInfo.percentHp.toFixed(1)}%`;

          const sourceInfo = document.createElement("div");
          sourceInfo.style.fontSize = "0.85em";
          sourceInfo.style.color = "#aaa";
          sourceInfo.textContent = damageInfo.source;

          td.appendChild(damageValue);
          td.appendChild(sourceInfo);

          // Add color scaling
          const getColorIntensity = (value) => {
            const normalized = (value - minDamage) / (maxDamage - minDamage);
            return Math.floor(normalized * 40);
          };

          td.style.backgroundColor = `rgba(255, 99, 71, ${getColorIntensity(damageInfo.percentHp)}%)`;
          tr.appendChild(td);
        });
      }

      maxDamageTable.appendChild(tr);
    });

    // Add some styling to the table
    maxDamageTable.style.borderCollapse = "collapse";
    const cells = maxDamageTable.getElementsByTagName("td");
    for (let cell of cells) {
      cell.style.padding = "8px 10px";
      cell.style.border = "1px solid #ddd";
      cell.style.textAlign = "center";
      cell.style.minWidth = "80px";
    }
  }

  // Check if we need to initialize with existing data
  // This is for when the page loads and mon-stats.js has already loaded data
  if (window.monsterData && window.monsterData.data && window.monsterData.columns) {
    data = window.monsterData.data;
    columns = window.monsterData.columns;
    updateMonsterSelect();
    renderCombinedDamageTable();
    renderMaxDamageTable();

    // Make sure the Damage to KO table is hidden by default
    damageToKoContainer.style.display = "none";
    toggleDamageToKoBtn.textContent = "Show Damage to KO Table";
  }
});
