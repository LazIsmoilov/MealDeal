"""
WebSocket route for live updates.

Clients connect to /ws and stay connected. The server pushes messages
(e.g. price-change notifications) through this channel. The endpoint itself
just keeps the connection alive and registered; the actual broadcasting is
triggered elsewhere (the price routes) via the shared connection manager.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websockets.manager import manager


router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Accept a client connection and keep it open until they disconnect.

    We don't expect meaningful messages *from* the client in this app — the
    channel is used server-to-client for broadcasts. We still loop on
    receive() so the connection stays alive and we detect disconnects
    cleanly (WebSocketDisconnect is raised when the client goes away).
    """
    await manager.connect(websocket)
    try:
        while True:
            # Block waiting for any client message. We ignore the content;
            # this call's real purpose is to keep the coroutine alive and
            # to raise WebSocketDisconnect when the client disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
