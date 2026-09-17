"""
Standalone latency benchmark for the Nexus /api/ai/chat endpoint
(RAG retrieval + Gemini call), without needing Locust.

Use this when you just want a quick number like:
"Averaged 1.2s per query (p95: 2.1s) across 30 runs" for a resume bullet.

Install:
    pip install requests

Usage:
    1. Fill in BASE_URL, EMAIL, PASSWORD below (or set as env vars).
    2. Make sure you already have at least one workspace with some
       documents uploaded (so retrieval has something to search).
    3. Run:
        python benchmark_ai_chat.py
"""

import os
import time
import statistics
import requests

BASE_URL = os.environ.get("NEXUS_BASE_URL", "http://localhost:8000")
EMAIL = os.environ.get("NEXUS_EMAIL", "you@example.com")
PASSWORD = os.environ.get("NEXUS_PASSWORD", "your-password")
WORKSPACE_ID = os.environ.get("NEXUS_WORKSPACE_ID")  # required
NUM_RUNS = int(os.environ.get("NEXUS_BENCH_RUNS", 30))
TEST_MESSAGE = "Summarize the key points from the documents in this workspace."


def login(session: requests.Session) -> None:
    """
    Login and store the httponly access_token cookie in the session.
    The Nexus login endpoint returns {"message": "Login successful"} —
    the JWT lives in the Set-Cookie header, NOT the JSON body.
    requests.Session() persists the cookie automatically.
    """
    resp = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=30,
    )
    resp.raise_for_status()
    if "access_token" not in session.cookies:
        raise SystemExit(
            f"Login succeeded (HTTP {resp.status_code}) but no access_token "
            "cookie was set. Check that PRODUCTION=False in your .env so "
            "cookies are sent without Secure/SameSite=None restrictions."
        )


def run_benchmark():
    if not WORKSPACE_ID:
        raise SystemExit(
            "Set NEXUS_WORKSPACE_ID to a workspace that already has documents in it."
        )

    session = requests.Session()
    login(session)
    # Cookie is now stored in session — no manual Authorization header needed.

    latencies = []
    errors = 0

    print(f"Running {NUM_RUNS} requests against {BASE_URL}/api/ai/chat ...")

    for i in range(1, NUM_RUNS + 1):
        start = time.perf_counter()
        try:
            resp = session.post(
                f"{BASE_URL}/api/ai/chat",
                json={"workspace_id": WORKSPACE_ID, "message": TEST_MESSAGE},
                timeout=60,
            )
            elapsed = time.perf_counter() - start
            if resp.status_code == 200:
                latencies.append(elapsed)
                print(f"  run {i:2d}: {elapsed:.2f}s")
            else:
                errors += 1
                print(f"  run {i:2d}: FAILED ({resp.status_code})")
        except requests.RequestException as e:
            errors += 1
            print(f"  run {i:2d}: ERROR ({e})")

    if not latencies:
        print("No successful runs -- check your credentials/workspace ID.")
        return

    latencies.sort()
    avg = statistics.mean(latencies)
    p50 = latencies[int(len(latencies) * 0.50)]
    p95 = latencies[min(int(len(latencies) * 0.95), len(latencies) - 1)]

    print("\n--- Results ---")
    print(f"Successful runs : {len(latencies)}/{NUM_RUNS} ({errors} errors)")
    print(f"Average latency : {avg:.2f}s")
    print(f"p50 latency     : {p50:.2f}s")
    print(f"p95 latency     : {p95:.2f}s")
    print(f"Min / Max       : {min(latencies):.2f}s / {max(latencies):.2f}s")


if __name__ == "__main__":
    run_benchmark()
