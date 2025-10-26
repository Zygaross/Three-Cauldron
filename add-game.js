#!/usr/bin/env node

/**
 * Quick helper script to add a new game to the manifest
 * Usage: node add-game.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const manifestPath = path.join(__dirname, 'public', 'games', 'games-manifest.json');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addGame() {
  console.log('\n🎮 Add New Game to Stellar Gaming Platform\n');
  console.log('Answer the questions below (press Enter for defaults):\n');

  const gameId = await question('Game ID (lowercase-with-hyphens): ');
  if (!gameId) {
    console.log('❌ Game ID is required!');
    rl.close();
    return;
  }

  const title = await question(`Game Title [${gameId}]: `) || gameId;
  const folder = await question(`Folder name [${gameId}]: `) || gameId;
  const category = await question('Category (Action/Arcade/RPG/etc) [Arcade]: ') || 'Arcade';
  const description = await question('Description (optional): ') || '';
  const rating = await question('Rating (1-5) [4.5]: ') || '4.5';
  const players = await question('Players count (e.g., 1.2K) [New]: ') || 'New';
  const earnings = await question('Earnings (e.g., 500 XLM) [0 XLM]: ') || '0 XLM';
  const useCustomImage = await question('Use custom image? (y/n) [n]: ');
  
  let image;
  if (useCustomImage.toLowerCase() === 'y') {
    image = await question(`Image path (e.g., /games/${folder}/thumbnail.png): `);
  } else {
    image = `https://picsum.photos/seed/${gameId}/600/400`;
  }

  const newGame = {
    id: gameId,
    title: title,
    folder: folder,
    image: image,
    category: category,
    rating: parseFloat(rating),
    players: players,
    earnings: earnings
  };

  if (description) {
    newGame.description = description;
  }

  // Read existing manifest
  let manifest = { games: [] };
  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(content);
  }

  // Add new game
  manifest.games.push(newGame);

  // Write back
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('\n✅ Game added successfully!\n');
  console.log('📋 Game details:');
  console.log(JSON.stringify(newGame, null, 2));
  console.log(`\n📁 Now add your HTML file to: public/games/${folder}/index.html`);
  console.log('\n🚀 Run "npm run dev" to see your game!\n');

  rl.close();
}

addGame().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
});
