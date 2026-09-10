from fastapi import APIRouter

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def list_notifications():
    return [
        {"id": 1, "title": "Token Assigned", "message": "Your Smart Token #42 is ready. 6 farmers ahead.", "timestamp": "10:30 AM", "type": "info"},
        {"id": 2, "title": "Quality Inspection Passed", "message": "Quality Grade A confirmed for Token #42.", "timestamp": "10:50 AM", "type": "success"},
        {"id": 3, "title": "Weight Locked", "message": "Verified Net Weight: 500 kg recorded.", "timestamp": "11:05 AM", "type": "warning"}
    ]
