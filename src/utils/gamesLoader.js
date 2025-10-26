// Utility to load and merge games from the manifest file with existing games data

/**
 * Loads games from the games manifest file
 * @returns {Promise<Array>} Array of game objects from manifest
 */
export async function loadGamesFromManifest() {
  try {
    const response = await fetch('/games/games-manifest.json');
    if (!response.ok) {
      console.warn('Games manifest not found, using default games only');
      return [];
    }
    const data = await response.json();
    
    // Transform manifest games to match the platform's game object structure
    return data.games.map((game, index) => ({
      id: `manifest-${game.id}`,
      title: game.title,
      image: game.image || `https://picsum.photos/seed/${game.id}/600/400`,
      players: game.players || "New",
      earnings: game.earnings || "0 XLM",
      rating: game.rating || 4.5,
      category: game.category || "Arcade",
      description: game.description || "",
      isPlayable: true,
      demoUrl: `/games/${game.folder}/index.html`
    }));
  } catch (error) {
    console.error('Error loading games manifest:', error);
    return [];
  }
}

/**
 * Merges manifest games with hardcoded featured games
 * @param {Array} featuredGames - Array of featured games
 * @returns {Promise<Array>} Combined array of all games
 */
export async function getAllGames(featuredGames) {
  const manifestGames = await loadGamesFromManifest();
  return [...manifestGames, ...featuredGames];
}
