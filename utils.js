// utils/fs.js
export async function getFS() {
    try {
      return await import('@tauri-apps/plugin-fs');
    } catch (error) {
      // Web fallback implementation
      return {
        readTextFile: async (path) => {
          console.warn('Tauri FS not available in web environment');
          throw new Error('File system API not available in browser');
        },
        // Add other method fallbacks as needed
        writeTextFile: async (path, content) => {
          console.warn('Tauri FS not available in web environment');
          throw new Error('File system API not available in browser');
        }
      };
    }
  }