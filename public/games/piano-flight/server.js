const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let currentPlayer = null;
let spectators = [];
let currentGameState = null;
let activeBets = [];

console.log('Piano Flight WebSocket Server running on ws://localhost:3000');

wss.on('connection', (ws) => {
    console.log('New connection');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data.type);
            
            switch (data.type) {
                case 'join_as_player':
                    if (currentPlayer) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'A player is already playing. Please wait or join as spectator.'
                        }));
                    } else {
                        currentPlayer = {
                            ws: ws,
                            name: data.name || 'Player'
                        };
                        ws.isPlayer = true;
                        ws.playerName = data.name;
                        
                        ws.send(JSON.stringify({
                            type: 'join_accepted',
                            role: 'player'
                        }));
                        
                        // Notify spectators
                        broadcast(spectators, {
                            type: 'game_started',
                            playerName: data.name
                        });
                        
                        console.log(`Player joined: ${data.name}`);
                    }
                    break;
                    
                case 'join_as_spectator':
                    spectators.push(ws);
                    ws.isSpectator = true;
                    
                    ws.send(JSON.stringify({
                        type: 'join_accepted',
                        role: 'spectator',
                        currentGameState: currentGameState
                    }));
                    
                    console.log('Spectator joined. Total spectators:', spectators.length);
                    break;
                    
                case 'game_update':
                    if (ws.isPlayer) {
                        currentGameState = {
                            status: 'playing',
                            score: data.score,
                            progress: data.progress,
                            difficulty: data.difficulty,
                            obstacles: data.obstacles,
                            particles: data.particles,
                            currentLane: data.currentLane,
                            planeAnimation: data.planeAnimation,
                            playerName: ws.playerName
                        };
                        
                        // Broadcast to spectators
                        broadcast(spectators, {
                            type: 'game_update',
                            ...currentGameState
                        });
                    }
                    break;
                    
                case 'game_over':
                    if (ws.isPlayer) {
                        const finalScore = data.score;
                        const finalProgress = data.progress;
                        const reachedGoal = finalProgress >= 500;
                        
                        console.log(`Game over! Score: ${finalScore}, Progress: ${finalProgress}, Reached goal: ${reachedGoal}`);
                        
                        // Process all bets
                        const results = activeBets.map(bet => {
                            const won = (bet.choice === 'over' && reachedGoal) || 
                                       (bet.choice === 'under' && !reachedGoal);
                            return {
                                spectatorWs: bet.spectatorWs,
                                won: won,
                                amount: bet.amount,
                                choice: bet.choice
                            };
                        });
                        
                        // Send results to each spectator
                        results.forEach(result => {
                            if (result.spectatorWs.readyState === WebSocket.OPEN) {
                                result.spectatorWs.send(JSON.stringify({
                                    type: 'game_result',
                                    won: result.won,
                                    amount: result.amount,
                                    choice: result.choice,
                                    finalScore: finalScore,
                                    finalProgress: finalProgress,
                                    reachedGoal: reachedGoal
                                }));
                            }
                        });
                        
                        // Clear bets
                        activeBets = [];
                        
                        // Notify all spectators game ended
                        broadcast(spectators, {
                            type: 'game_ended',
                            finalScore: finalScore,
                            finalProgress: finalProgress
                        });
                        
                        currentGameState = null;
                    }
                    break;
                    
                case 'place_bet':
                    if (ws.isSpectator) {
                        // Check if already bet
                        const existingBet = activeBets.find(b => b.spectatorWs === ws);
                        if (existingBet) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'You have already placed a bet for this game'
                            }));
                            return;
                        }
                        
                        // Check if game is in progress
                        if (!currentGameState || currentGameState.status !== 'playing') {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'No game in progress. Wait for a player to start.'
                            }));
                            return;
                        }
                        
                        // Add bet
                        activeBets.push({
                            spectatorWs: ws,
                            amount: data.amount,
                            choice: data.choice // 'over' or 'under'
                        });
                        
                        ws.send(JSON.stringify({
                            type: 'bet_confirmed',
                            bet: {
                                amount: data.amount,
                                choice: data.choice
                            }
                        }));
                        
                        console.log(`Bet placed: $${data.amount} on ${data.choice}`);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Connection closed');
        
        if (ws.isPlayer && currentPlayer && currentPlayer.ws === ws) {
            console.log('Player disconnected');
            currentPlayer = null;
            currentGameState = null;
            
            // Clear all bets
            activeBets = [];
            
            // Notify spectators
            broadcast(spectators, {
                type: 'player_disconnected'
            });
        }
        
        if (ws.isSpectator) {
            spectators = spectators.filter(s => s !== ws);
            // Remove any bets from this spectator
            activeBets = activeBets.filter(b => b.spectatorWs !== ws);
            console.log('Spectator disconnected. Remaining:', spectators.length);
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcast(clients, message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

console.log('Server ready for players and spectators!');
