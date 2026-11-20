# Shared marketplace pilot

The API and its browser client use the same origin. Install Python 3.12 and PostgreSQL 16. Create an empty database named workpassport. From the repository root in PowerShell, substitute your local database credentials and run:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/workpassport"
Get-ChildItem backend/migrations/*.sql | Sort-Object Name | ForEach-Object { psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f $_.FullName; if ($LASTEXITCODE) { throw "Migration failed" } }
$env:LOCAL_HTTP = "1"
uvicorn backend.app:app --reload
```

Apply these initial migrations once per empty database. Open http://127.0.0.1:8000 for the shared client. To link it from the React demo, start Vite with VITE_MARKETPLACE_URL set to the API origin. Use two browsers to register a business owner and a worker, publish a listing and submit an application. Authentication uses expiring server-side sessions. The LOCAL_HTTP setting is for loopback development. Deploy behind HTTPS with this variable unset. Before public enrollment, add operational rate limits, account recovery and email confirmation.

An owner can add an existing account to the workspace through POST /api/organizations/{org}/members. Send JSON with email and role and the X-WorkPassport header set to 1. Owners, admins and recruiters can publish and review organization jobs. Members have no hiring permissions. Existing device demo accounts and records stay local.
