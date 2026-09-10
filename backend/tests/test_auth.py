from fastapi.testclient import TestClient
from backend.main import app

def test_root():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["system"] == "Farmer Procurement Issue Resolution System"

def test_login_success():
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={
            "phone": "9876543210",
            "password": "farmer123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"

def test_list_centres():
    with TestClient(app) as client:
        response = client.get("/api/centres")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
