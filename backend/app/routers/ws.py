import asyncio
import json
import random
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["Websockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Simulate live events coming in
        while True:
            await asyncio.sleep(5) # Send an update every 5 seconds
            
            # Generate a mock live event
            live_event = {
                "id": f"live-{random.randint(1000, 9999)}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "asset": {"name": random.choice(["Main Entrance", "Server Room", "Loading Dock", "CEO Office"])},
                "user": {"full_name": random.choice(["Alice Smith", "Bob Jones", "Charlie Davis", "Diana Prince"])},
                "event_type": random.choice(["badge_swipe", "door_forced", "tailgating_detected", "face_recognized"]),
                "trust_score": random.randint(30, 95),
            }
            
            # If trust score is low, generate an alert
            if live_event["trust_score"] < 50:
                live_event["alert"] = {
                    "severity": random.choice(["medium", "high", "critical"]),
                    "description": f"Low trust score ({live_event['trust_score']}) detected for {live_event['user']['full_name']}"
                }
                
            await websocket.send_text(json.dumps(live_event))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
