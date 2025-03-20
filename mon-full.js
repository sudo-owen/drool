
import { getFS, loadFullMonsFromCsv, loadMovesFromCsv } from "./utils.js";
import { typeData } from "./type-data.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Load mon data from CSV
    const monsFromCsv = await loadFullMonsFromCsv();
    // Load moves data using the utility function
    const movesData = await loadMovesFromCsv();

    // Calculate max values for each stat
    const maxStats = {
        HP: Math.max(...monsFromCsv.map(mon => mon.HP)),
        Attack: Math.max(...monsFromCsv.map(mon => mon.Attack)),
        Defense: Math.max(...monsFromCsv.map(mon => mon.Defense)),
        SpecialAttack: Math.max(...monsFromCsv.map(mon => mon.SpecialAttack)),
        SpecialDefense: Math.max(...monsFromCsv.map(mon => mon.SpecialDefense)),
        Speed: Math.max(...monsFromCsv.map(mon => mon.Speed))
    };

    let monIndex = 0;
    
    // Create all monster elements but hide them initially
    createAllMonElements(monsFromCsv, maxStats, movesData);

    // Bind to prev/next buttons to update index
    document.querySelector("#prev-mon-btn").addEventListener("click", () => {
        monIndex = (monIndex - 1 + monsFromCsv.length) % monsFromCsv.length;
        showActiveMon();
    });
    document.querySelector("#next-mon-btn").addEventListener("click", () => {
        monIndex = (monIndex + 1 + monsFromCsv.length) % monsFromCsv.length;
        showActiveMon();
    });

    // Show the first mon
    showActiveMon();
    
    // Create all monster elements but hide them
    function createAllMonElements(mons, maxStats, movesData) {
        const nameContainer = document.querySelector("#mon-container-name");
        const imgsContainer = document.querySelector("#mon-container-imgs");
        
        // Clear containers
        nameContainer.innerHTML = '';
        imgsContainer.innerHTML = '';
        
        mons.forEach((mon, idx) => {
            const monNameLower = mon.Name.toLowerCase();
            
            // Create name element
            const nameElement = document.createElement('div');
            nameElement.className = 'mon-name-element';
            nameElement.dataset.index = idx;
            nameElement.style.display = 'none'; // Hide initially
            nameElement.innerHTML = `
                <img src="imgs/${monNameLower}_mini.gif" alt="${mon.Name}" 
                     onerror="this.style.display='none'">
                <div>${mon.Name}</div>
            `;
            
            // Create images and stats element
            const imgsElement = document.createElement('div');
            imgsElement.className = 'mon-imgs-element';
            imgsElement.dataset.index = idx;
            imgsElement.style.display = 'none'; // Hide initially
            
            // Add front and back images
            const monImagesHTML = `
                <div class="mon-sprites">
                    <img src="imgs/${monNameLower}_front.gif" alt="${mon.Name} front" 
                         onerror="this.style.display='none'" class="mon-sprite">
                    <img src="imgs/${monNameLower}_back.gif" alt="${mon.Name} back" 
                         onerror="this.style.display='none'" class="mon-sprite">
                </div>
            `;
            
            // Create stats grid
            const statsHTML = `
                <div class="stats-grid">
                    <div class="stat-row">
                        <span class="stat-label">HP</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill hp-bar"
                                     style="width: ${(mon.HP / maxStats.HP) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.HP}</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">ATK</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill attack-bar"
                                     style="width: ${(mon.Attack / maxStats.Attack) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.Attack}</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">𝞕ATK</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill special-attack-bar"
                                     style="width: ${(mon.SpecialAttack / maxStats.SpecialAttack) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.SpecialAttack}</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">DEF</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill defense-bar"
                                     style="width: ${(mon.Defense / maxStats.Defense) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.Defense}</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">𝞕DEF</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill special-defense-bar"
                                     style="width: ${(mon.SpecialDefense / maxStats.SpecialDefense) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.SpecialDefense}</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">SPD</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-background">
                                <div class="stat-bar-fill speed-bar"
                                     style="width: ${(mon.Speed / maxStats.Speed) * 100}%"></div>
                            </div>
                            <span class="stat-value">${mon.Speed}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Filter moves for this monster
            const monMoves = movesData ? movesData.filter(move => move.Mon === mon.Name) : [];
            
            // Create moves section
            let movesHTML = '';
            if (monMoves && monMoves.length > 0) {
                movesHTML = `
                    <div class="mon-moves-section">
                        <div class="moves-grid">
                            ${monMoves.map(move => {
                                const moveType = move.Type || '';
                                const moveClass = move.Class || '';
                                const typeInfo = typeData[moveType] || { bgColor: '#333', textColor: '#fff', emoji: '' };
                                
                                // Determine class styling and emoji based on mon-moves.js
                                let classStyle = '';
                                let classEmoji = '';
                                
                                if (moveClass === 'Physical') {
                                    classStyle = 'background-color: #C92112; color: white;';
                                    classEmoji = '👊'; // Physical emoji
                                } else if (moveClass === 'Special') {
                                    classStyle = 'background-color: #4F5870; color: white;';
                                    classEmoji = '🌀'; // Special emoji
                                } else if (moveClass === 'Other') {
                                    classStyle = 'background-color: #8C888C; color: white;';
                                    classEmoji = '✨'; // Other emoji
                                } else if (moveClass === 'Self') {
                                    classStyle = 'background-color: #8C888C; color: white;';
                                    classEmoji = '🔄'; // Self emoji
                                }
                                
                                return `
                                    <div class="move-card">
                                        <div class="move-header">
                                            <span class="move-name">${move.Name || 'Unknown'}</span>
                                            <span class="move-type" style="background-color: ${typeInfo.bgColor}; color: ${typeInfo.textColor};">
                                                ${typeInfo.emoji} ${moveType}
                                            </span>
                                        </div>
                                        <div class="move-details">
                                            <div class="move-stat move-class" style="${classStyle}">
                                                ${classEmoji} ${moveClass}
                                            </div>
                                            <div class="move-stat">
                                                <span class="stat-icon">⚔️</span> ${move.Power || '-'}
                                            </div>
                                            <div class="move-stat">
                                                <span class="stat-icon">🔋</span> ${move.Stamina || '-'}
                                            </div>
                                            <div class="move-stat">
                                                <span class="stat-icon">🎯</span> ${move.Accuracy || '-'}%
                                            </div>
                                        </div>
                                        ${move.Description ? `<div class="move-description">${move.Description}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
            
            imgsElement.innerHTML = monImagesHTML + statsHTML + movesHTML;
            
            // Add elements to containers
            nameContainer.appendChild(nameElement);
            imgsContainer.appendChild(imgsElement);
        });
    }
    
    // Show only the active monster
    function showActiveMon() {
        // Hide all elements
        document.querySelectorAll('.mon-name-element, .mon-imgs-element').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show only the active elements
        const activeNameEl = document.querySelector(`.mon-name-element[data-index="${monIndex}"]`);
        const activeImgsEl = document.querySelector(`.mon-imgs-element[data-index="${monIndex}"]`);
        
        if (activeNameEl) activeNameEl.style.display = 'flex';
        if (activeImgsEl) activeImgsEl.style.display = 'block';
    }
});
