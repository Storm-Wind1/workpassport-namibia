from fastapi.testclient import TestClient
from uuid import uuid4
from .app import app


def client():
    return TestClient(app, base_url="https://testserver", headers={"X-WorkPassport": "1"})


def register(c):
    email = f"{uuid4()}@example.test"
    details = {"email": email, "password": "a long test passphrase", "name": "Test User"}
    assert c.post("/api/register", json=details).status_code == 201
    return details


def test_two_account_marketplace():
    owner, worker, outsider = client(), client(), client()
    register(owner)
    credentials = register(worker)
    org = owner.post("/api/organizations", json={"name": "Workshop"}).json()["id"]
    listing = dict(title="Carpenter", description="Repair a door", location="Windhoek",
                   category="Carpentry", work_type="Temporary gig", organization_id=org)
    assert worker.post("/api/jobs", json=listing).status_code == 403
    job = owner.post("/api/jobs", json=listing).json()["id"]
    assert any(j["id"] == job for j in outsider.get("/api/jobs").json())
    url = f"/api/jobs/{job}/applications"
    assert outsider.post(url,json={"message":"Available"}).status_code == 401
    assert worker.post(url,json={"message":"Available"}).status_code == 201
    assert worker.post(url,json={"message":"Again"}).status_code == 409
    assert owner.get("/api/applications").json()[0]["message"] == "Available"
    profile = dict(headline="Carpenter",location="Windhoek",bio="Door repairs",published=True)
    worker_id = worker.put("/api/profile",json=profile).json()["user_id"]
    assert any(p["user_id"] == worker_id for p in outsider.get("/api/workers").json())
    worker.put("/api/profile",json={**profile,"published":False}).raise_for_status()
    assert all(p["user_id"] != worker_id for p in outsider.get("/api/workers").json())
    assert owner.post(f"/api/organizations/{org}/members",json={"email":credentials["email"],"role":"recruiter"}).status_code == 201
    assert worker.post("/api/jobs",json=listing).status_code == 201
    cookie = worker.cookies.get("wp_session")
    worker.post("/api/logout").raise_for_status()
    assert worker.get("/api/me",headers={"Cookie":f"wp_session={cookie}"}).status_code == 401
    assert worker.post("/api/login",json=credentials).status_code == 200
