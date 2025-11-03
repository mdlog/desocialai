import { WebSocket } from 'ws';

// WebSocket connection storage
const connectedClients = new Set<WebSocket>();

/**
 * Add a WebSocket client to the connected clients set
 * @param ws WebSocket client
 */
export function addClient(ws: WebSocket) {
    connectedClients.add(ws);
    console.log('WebSocket client added. Total clients:', connectedClients.size);
}

/**
 * Remove a WebSocket client from the connected clients set
 * @param ws WebSocket client
 */
export function removeClient(ws: WebSocket) {
    connectedClients.delete(ws);
    console.log('WebSocket client removed. Total clients:', connectedClients.size);
}

/**
 * Broadcast a message to all connected WebSocket clients
 * @param message Message to broadcast
 */
export function broadcastToAll(message: any) {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

/**
 * Get the number of connected clients
 * @returns Number of connected clients
 */
export function getConnectedClientsCount(): number {
    return connectedClients.size;
}
