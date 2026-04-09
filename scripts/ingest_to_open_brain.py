#!/usr/bin/env python3
"""
ingest_to_open_brain.py — Push HUMMBL Bibliography entries to Open Brain

Reads all BibTeX entries via query.js (or directly via Python BibTeX parser),
then POSTs each entry as a ledger entry to the Open Brain server.

Usage:
    python scripts/ingest_to_open_brain.py [options]

Options:
    --dry-run           Print entries without posting (default)
    --post              Actually POST to Open Brain
    --tier T7           Filter by tier (repeatable)
    --keyword HUMMBL:BKI  Filter by keyword (repeatable)
    --limit N           Limit to N entries
    --url URL           Open Brain base URL (default: http://100.109.69.16:11435)
    --token TOKEN       Auth token (default: $OPEN_BRAIN_TOKEN)
    --agent NAME        Ledger agent name (default: hummbl-bibliography)
    --verbose           Print each entry as it is processed

Environment:
    OPEN_BRAIN_TOKEN    Bearer token for Open Brain auth
    OPEN_BRAIN_RELAY_URL Override default Open Brain URL

Exit codes:
    0   Success
    1   Connection error
    2   Auth error
    3   Partial failure (some entries failed)
"""

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# ── Constants ─────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
BIBLIOGRAPHY_DIR = REPO_ROOT / "bibliography"
QUERY_SCRIPT = REPO_ROOT / "toolkit" / "src" / "query.js"

DEFAULT_OPEN_BRAIN_URL = "http://100.109.69.16:11435"
DEFAULT_AGENT = "hummbl-bibliography"

LEDGER_ENTRY_TYPE = "discovery"
LEDGER_SCOPE = "bibliography"


# ── Argument parsing ───────────────────────────────────────────────────────────

def parse_args(argv):
    args = argv[1:]
    opts = {
        "dry_run": True,
        "tiers": [],
        "keywords": [],
        "limit": None,
        "url": os.environ.get("OPEN_BRAIN_RELAY_URL", DEFAULT_OPEN_BRAIN_URL),
        "token": os.environ.get("OPEN_BRAIN_TOKEN", ""),
        "agent": DEFAULT_AGENT,
        "verbose": False,
    }

    i = 0
    while i < len(args):
        a = args[i]
        if a == "--post":
            opts["dry_run"] = False
        elif a == "--dry-run":
            opts["dry_run"] = True
        elif a == "--tier":
            opts["tiers"].append(args[i + 1]); i += 1
        elif a == "--keyword":
            opts["keywords"].append(args[i + 1]); i += 1
        elif a == "--limit":
            opts["limit"] = int(args[i + 1]); i += 1
        elif a == "--url":
            opts["url"] = args[i + 1]; i += 1
        elif a == "--token":
            opts["token"] = args[i + 1]; i += 1
        elif a == "--agent":
            opts["agent"] = args[i + 1]; i += 1
        elif a == "--verbose":
            opts["verbose"] = True
        i += 1

    return opts


# ── BibTeX loader (via query.js) ───────────────────────────────────────────────

def load_entries(opts):
    """Run query.js and return parsed JSON entries."""
    cmd = ["node", str(QUERY_SCRIPT), "--format", "json"]

    for tier in opts["tiers"]:
        cmd += ["--tier", tier]
    for kw in opts["keywords"]:
        cmd += ["--keyword", kw]
    if opts["limit"]:
        cmd += ["--limit", str(opts["limit"])]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=str(REPO_ROOT / "toolkit"),
        )
    except FileNotFoundError:
        print("ERROR: node not found. Install Node.js to use query.js.", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: query.js failed: {e.stderr}", file=sys.stderr)
        sys.exit(1)

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        print(f"ERROR: query.js returned invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)


# ── Entry → Ledger conversion ──────────────────────────────────────────────────

def entry_to_ledger(entry, agent):
    """Convert a bibliography entry dict to an Open Brain ledger payload."""
    key = entry.get("key", "unknown")
    title = entry.get("title") or key
    author = entry.get("author") or "Unknown"
    year = entry.get("year") or "?"
    tier = entry.get("tier") or "Unknown"
    abstract = entry.get("abstract") or ""
    keywords = entry.get("keywords") or ""
    doi = entry.get("doi") or ""
    url = entry.get("url") or ""

    # Build citation string
    citation_parts = [author, f"({year})", title]
    if doi:
        citation_parts.append(f"doi:{doi}")
    elif url:
        citation_parts.append(url)
    citation = ". ".join(citation_parts)

    # Build tags from HUMMBL keywords
    tags = ["bibliography", tier.lower()]
    for kw in re.split(r"[,;\s]+", keywords):
        kw = kw.strip()
        if kw.startswith("HUMMBL:"):
            tags.append(kw.lower())

    # Truncate abstract for ledger (max 400 chars)
    summary = abstract[:400] + ("…" if len(abstract) > 400 else "")
    if not summary:
        summary = f"{title} ({year}) — {tier} bibliography entry."

    return {
        "agent": agent,
        "type": LEDGER_ENTRY_TYPE,
        "scope": LEDGER_SCOPE,
        "summary": f"[{tier}] {title} ({year})",
        "detail": citation,
        "evidence": summary,
        "confidence": 0.9,
        "tags": list(set(tags)),
        "metadata": {
            "bib_key": key,
            "tier": tier,
            "doi": doi,
            "url": url,
            "author": author,
            "year": year,
            "keywords": keywords,
        },
    }


# ── HTTP POST to Open Brain ────────────────────────────────────────────────────

def post_entry(base_url, token, payload):
    """POST a ledger entry to Open Brain /ledger/post. Returns (ok, status_code, body)."""
    endpoint = base_url.rstrip("/") + "/ledger/post"
    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return True, resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        if e.code == 401:
            print("ERROR: Auth failed (401). Check OPEN_BRAIN_TOKEN.", file=sys.stderr)
            sys.exit(2)
        return False, e.code, body
    except urllib.error.URLError as e:
        return False, 0, str(e.reason)


# ── Health check ───────────────────────────────────────────────────────────────

def check_health(base_url, token):
    """Verify Open Brain is reachable. Returns True if healthy."""
    endpoint = base_url.rstrip("/") + "/health"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(endpoint, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    opts = parse_args(sys.argv)

    print(f"Loading entries from bibliography... ", end="", flush=True)
    entries = load_entries(opts)
    print(f"{len(entries)} entries loaded.")

    if not entries:
        print("No entries matched filters. Exiting.")
        return

    if opts["dry_run"]:
        print(f"\nDRY RUN — would POST {len(entries)} entries to {opts['url']}")
        print("Use --post to actually send.\n")
        if opts["verbose"]:
            for e in entries:
                payload = entry_to_ledger(e, opts["agent"])
                print(json.dumps(payload, indent=2))
                print("---")
        else:
            # Print summary table
            print(f"{'KEY':<35} {'TIER':<4} {'YEAR':<5} {'TAGS'}")
            print("-" * 80)
            for e in entries:
                kws = [kw.strip() for kw in re.split(r"[,;\s]+", e.get("keywords") or "")
                       if kw.strip().startswith("HUMMBL:")]
                print(f"{e.get('key','?'):<35} {e.get('tier','?'):<4} {e.get('year','?'):<5} {', '.join(kws[:3])}")
            print(f"\n{len(entries)} entries would be ingested.")
        return

    # Live POST mode
    if not opts["token"]:
        print("WARNING: No OPEN_BRAIN_TOKEN set. Posting unauthenticated.", file=sys.stderr)

    print(f"Checking Open Brain health at {opts['url']}...")
    if not check_health(opts["url"], opts["token"]):
        print(f"ERROR: Open Brain unreachable at {opts['url']}", file=sys.stderr)
        print("Check that nodezero is up and Open Brain is running (port 11435).", file=sys.stderr)
        sys.exit(1)
    print("Open Brain healthy. Beginning ingest...\n")

    ok_count = 0
    fail_count = 0
    failures = []

    for i, entry in enumerate(entries, 1):
        key = entry.get("key", "?")
        payload = entry_to_ledger(entry, opts["agent"])

        ok, status, body = post_entry(opts["url"], opts["token"], payload)

        if ok:
            ok_count += 1
            if opts["verbose"]:
                print(f"  [{i:3d}/{len(entries)}] ✓ {key}")
            elif i % 20 == 0 or i == len(entries):
                print(f"  Progress: {i}/{len(entries)} ({ok_count} ok, {fail_count} failed)")
        else:
            fail_count += 1
            failures.append((key, status, body[:120]))
            print(f"  [{i:3d}/{len(entries)}] ✗ {key} — HTTP {status}: {body[:80]}")

    print(f"\nIngest complete: {ok_count} ok, {fail_count} failed out of {len(entries)} entries.")

    if failures:
        print("\nFailed entries:")
        for key, status, body in failures:
            print(f"  {key}: HTTP {status} — {body}")
        sys.exit(3)


if __name__ == "__main__":
    main()
