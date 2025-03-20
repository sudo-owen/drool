// utils/fs.js
export async function getFS() {
  try {
    return await import("@tauri-apps/plugin-fs");
  } catch (error) {
    // Web fallback implementation
    return {
      readTextFile: async (path) => {
        console.warn("Tauri FS not available in web environment");
        throw new Error("File system API not available in browser");
      },
      // Add other method fallbacks as needed
      writeTextFile: async (path, content) => {
        console.warn("Tauri FS not available in web environment");
        throw new Error("File system API not available in browser");
      },
    };
  }
}

export async function loadMonsFromCsv() {
  try {
    const response = await fetch('mons.csv');
    if (response.ok) {
      const csvContent = await response.text();
      const lines = csvContent.split(/\r\n|\n/);
      
      if (lines.length < 2) return [];
      
      // Skip header, parse data rows
      let monsFromCsv = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCsvLine(line);
        if (values[0]) { // If it has a name
          monsFromCsv.push({ Name: values[0] });
        }
      }
      return monsFromCsv;
    }
  } catch (error) {
    console.error("Error loading mons.csv:", error);
  }
}

export async function loadMovesFromCsv() {
  try {
    const response = await fetch('moves.csv');
    if (response.ok) {
      const csvContent = await response.text();
      const lines = csvContent.split(/\r\n|\n/);
      
      if (lines.length < 2) return [];
      
      // Skip header, parse data rows
      let movesFromCsv = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCsvLine(line);
        if (values[0]) { // If it has a name
          movesFromCsv.push({ Name: values[0] });
        }
      }
      return movesFromCsv;
    }
  } catch (error) {
    console.error("Error loading moves.csv:", error);
  }
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quotes inside quotes - add a single quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  return result;
}