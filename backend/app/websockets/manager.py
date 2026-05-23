"""
WebSocket connection manager.

Maintains the set of currently-connected WebSocket clients and provides a
broadcast() method to push a message to all of them. This is the mechanism
behind live price updates: when an admin changes a price, the price routes
call broadcast() and every connected client is notified in real time.

A single shared instance (created at the bottom) is imported wherever
broadcasting is needed, so all connections live in one registry.
"""

from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections and broadcasts messages."""

    def __init__(self) -> None:
        # Active connections. A list is fine for this app's scale; for very
        # high connection counts a set keyed by id would be more efficient.
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accept a new connection and register it."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a connection from the registry (on disconnect)."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        """Send a JSON message to every connected client.

        Connections that error out (e.g. client vanished without a clean
        close) are collected and removed afterwards, so a dead socket never
        breaks the broadcast for everyone else.
        """
        dead: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.disconnect(connection)


# Single shared instance imported across the app.
manager = ConnectionManager()
