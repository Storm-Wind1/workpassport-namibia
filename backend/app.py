import hashlib
import os
import secrets
from pathlib import Path
from uuid import UUID

import psycopg
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from psycopg.rows import dict_row
from pydantic import BaseModel, Field, StringConstraints
from typing import Annotated, Literal

app = FastAPI(title="WorkPassport Namibia")
passwords = PasswordHasher()
dummy_hash = passwords.hash(secrets.token_urlsafe(32))
Label = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=180)]
BodyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


def database():
    with psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row) as conn:
        yield conn


class Credentials(BaseModel):
    email: Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$", max_length=254)]
    password: str = Field(min_length=12, max_length=256)


class Registration(Credentials):
    name: Label


class Organization(BaseModel):
    name: Label
    status: Literal["informal", "registered"] = "informal"


class Member(BaseModel):
    email: Label
    role: Literal["admin", "recruiter", "member"]


class Listing(BaseModel):
    title: Label
    description: BodyText
    location: Label
    category: Label
    work_type: Label
    organization_id: UUID | None = None


class Application(BaseModel):
    message: BodyText


class Profile(BaseModel):
    headline: Label
    location: Label
    bio: BodyText
    published: bool


@app.middleware("http")
async def protect_writes(request: Request, call_next):
    # Cross-origin pages cannot send this header without a successful CORS preflight.
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.headers.get("X-WorkPassport") != "1":
        return Response(status_code=403)
    result = await call_next(request)
    result.headers["Cache-Control"] = "no-store"
    return result


def digest(token):
    return hashlib.sha256(token.encode()).digest()


def actor(request: Request, conn=Depends(database)):
    token = request.cookies.get("wp_session")
    row = token and conn.execute(
        """SELECT u.id, u.display_name FROM users u JOIN sessions s ON s.user_id=u.id
           WHERE s.token_digest=%s AND s.expires_at>now()""", (digest(token),)
    ).fetchone()
    if not row:
        raise HTTPException(401, "Sign in first.")
    return row


def start_session(conn, user, response, request):
    old = request.cookies.get("wp_session")
    if old:
        conn.execute("DELETE FROM sessions WHERE token_digest=%s", (digest(old),))
    token = secrets.token_urlsafe(32)
    conn.execute("INSERT INTO sessions(token_digest,user_id,expires_at) VALUES (%s,%s,now()+interval '7 days')",
                 (digest(token), user))
    response.set_cookie("wp_session", token, httponly=True, secure=os.getenv("LOCAL_HTTP") != "1",
                        samesite="lax", max_age=604800, path="/")


@app.post("/api/register", status_code=201)
def register(data: Registration, response: Response, request: Request, conn=Depends(database)):
    row = conn.execute("""INSERT INTO users(email,password_hash,display_name) VALUES (%s,%s,%s)
                       ON CONFLICT DO NOTHING RETURNING id""",
                       (data.email.lower(), passwords.hash(data.password), data.name)).fetchone()
    if not row:
        raise HTTPException(409, "Account could not be created with those details.")
    start_session(conn, row["id"], response, request)
    return row


@app.post("/api/login")
def login(data: Credentials, response: Response, request: Request, conn=Depends(database)):
    user = conn.execute("SELECT id,password_hash FROM users WHERE lower(email)=lower(%s)", (data.email,)).fetchone()
    try:
        passwords.verify(user["password_hash"] if user else dummy_hash, data.password)
    except VerifyMismatchError:
        raise HTTPException(401, "Email or password is incorrect.")
    if not user:
        raise HTTPException(401, "Email or password is incorrect.")
    start_session(conn, user["id"], response, request)
    return {"id": user["id"]}


@app.post("/api/logout")
def logout(request: Request, response: Response, conn=Depends(database)):
    conn.execute("DELETE FROM sessions WHERE token_digest=%s", (digest(request.cookies.get("wp_session", "")),))
    response.delete_cookie("wp_session", path="/")
    return {"signed_out": True}


@app.get("/api/me")
def me(user=Depends(actor)):
    return user


@app.post("/api/organizations", status_code=201)
def organization(data: Organization, user=Depends(actor), conn=Depends(database)):
    org = conn.execute("INSERT INTO organizations(trading_name,business_status) VALUES (%s,%s) RETURNING id",
                       (data.name, data.status)).fetchone()
    conn.execute("INSERT INTO memberships VALUES (%s,%s,'owner')", (org["id"], user["id"]))
    return org


def require_role(conn, org, user, roles):
    row = conn.execute("SELECT role FROM memberships WHERE organization_id=%s AND user_id=%s FOR SHARE",
                       (org, user)).fetchone()
    if not row or row["role"] not in roles:
        raise HTTPException(403, "Your workspace role does not allow this action.")


@app.post("/api/organizations/{org}/members", status_code=201)
def add_member(org: UUID, data: Member, user=Depends(actor), conn=Depends(database)):
    require_role(conn, org, user["id"], {"owner"})
    row = conn.execute("""INSERT INTO memberships(organization_id,user_id,role)
                       SELECT %s,id,%s FROM users WHERE lower(email)=lower(%s)
                       ON CONFLICT DO NOTHING RETURNING user_id""", (org, data.role, data.email)).fetchone()
    if not row:
        raise HTTPException(409, "Choose an existing account outside this workspace.")
    return row


@app.get("/api/jobs")
def jobs(conn=Depends(database)):
    return conn.execute("""SELECT j.id,j.posted_by,j.title,j.description,j.location,j.category,j.work_type,
                        coalesce(o.trading_name,u.display_name) AS poster FROM jobs j
                        JOIN users u ON u.id=j.posted_by LEFT JOIN organizations o ON o.id=j.organization_id
                        WHERE j.status='open' ORDER BY j.created_at DESC,j.id""").fetchall()


@app.post("/api/jobs", status_code=201)
def post_job(data: Listing, user=Depends(actor), conn=Depends(database)):
    if data.organization_id:
        require_role(conn, data.organization_id, user["id"], {"owner","admin","recruiter"})
    return conn.execute("""INSERT INTO jobs(posted_by,organization_id,title,description,location,category,work_type)
                        VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                        (user["id"],data.organization_id,data.title,data.description,data.location,data.category,data.work_type)).fetchone()


@app.post("/api/jobs/{job}/applications", status_code=201)
def apply(job: UUID, data: Application, user=Depends(actor), conn=Depends(database)):
    listing = conn.execute("SELECT status,posted_by FROM jobs WHERE id=%s FOR SHARE", (job,)).fetchone()
    if not listing:
        raise HTTPException(404, "Job not found.")
    if listing["status"] != "open" or listing["posted_by"] == user["id"]:
        raise HTTPException(409, "You cannot apply to this listing.")
    result = conn.execute("""INSERT INTO applications(job_id,applicant_id,message) VALUES (%s,%s,%s)
                          ON CONFLICT DO NOTHING RETURNING id""", (job,user["id"],data.message)).fetchone()
    if not result:
        raise HTTPException(409, "You already applied to this job.")
    return result


@app.get("/api/applications")
def applications(user=Depends(actor), conn=Depends(database)):
    return conn.execute("""SELECT a.id,a.message,a.status,j.title,u.display_name AS applicant
                        FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.applicant_id
                        WHERE a.applicant_id=%s OR (j.organization_id IS NULL AND j.posted_by=%s)
                        OR EXISTS (SELECT 1 FROM memberships m WHERE m.organization_id=j.organization_id
                        AND m.user_id=%s AND m.role IN ('owner','admin','recruiter')) ORDER BY a.created_at DESC""",
                        (user["id"],)*3).fetchall()


@app.put("/api/profile")
def profile(data: Profile, user=Depends(actor), conn=Depends(database)):
    return conn.execute("""INSERT INTO worker_profiles(user_id,headline,location,bio,published)
                        VALUES (%s,%s,%s,%s,%s) ON CONFLICT(user_id) DO UPDATE SET
                        headline=excluded.headline,location=excluded.location,bio=excluded.bio,published=excluded.published
                        RETURNING user_id,published""", (user["id"],data.headline,data.location,data.bio,data.published)).fetchone()


@app.get("/api/workers")
def workers(conn=Depends(database)):
    return conn.execute("""SELECT p.user_id,u.display_name,p.headline,p.location,p.bio FROM worker_profiles p
                        JOIN users u ON u.id=p.user_id WHERE p.published ORDER BY u.display_name,p.user_id""").fetchall()


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(Path(__file__).with_name("marketplace.html"))


@app.get("/api/organizations")
def my_organizations(user=Depends(actor), conn=Depends(database)):
    return conn.execute("""SELECT o.id,o.trading_name,m.role FROM organizations o JOIN memberships m
                        ON m.organization_id=o.id WHERE m.user_id=%s ORDER BY o.trading_name""",
                        (user["id"],)).fetchall()


@app.get("/api/profile")
def my_profile(user=Depends(actor), conn=Depends(database)):
    return conn.execute("SELECT headline,location,bio,published FROM worker_profiles WHERE user_id=%s",
                        (user["id"],)).fetchone()
