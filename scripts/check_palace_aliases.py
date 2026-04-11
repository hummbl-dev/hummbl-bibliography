#!/usr/bin/env python3
"""
check_palace_aliases.py

Audit toolkit/src/extensions/memoryPalace.ts for alias key collisions.
Handles both single-quoted ('value') and double-quoted ("Occam's razor") strings.

Exit codes:
  0  — no collisions
  1  — collisions found (details printed to stderr)
  2  — file not found or parse error

Usage:
  python3 scripts/check_palace_aliases.py
  python3 scripts/check_palace_aliases.py --path path/to/memoryPalace.ts
  python3 scripts/check_palace_aliases.py --verbose
"""

import re
import sys
import argparse
from pathlib import Path


# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

def default_palace_path() -> Path:
    here = Path(__file__).parent
    return here.parent / "toolkit" / "src" / "extensions" / "memoryPalace.ts"


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def extract_string_values(text: str) -> list[str]:
    """
    Extract all string literal values from text, handling:
      - Single-quoted:  'value'
      - Double-quoted:  "Occam's razor"
    Returns list of unescaped content between quotes.

    Uses a combined alternation pattern (double | single) so that a
    double-quoted string containing an apostrophe is consumed before the
    single-quote pattern can fire on the apostrophe.
    """
    # Double-quote branch must come FIRST so apostrophes inside "..." are consumed
    # before the single-quote branch can match them.
    combined = re.compile(r'"([^"]*)"' + r"|" + r"'([^']*)'")
    results = []
    for m in combined.finditer(text):
        # Group 1 = double-quoted content, group 2 = single-quoted content
        results.append(m.group(1) if m.group(1) is not None else m.group(2))
    return results


def parse_entries(source: str) -> list[dict]:
    """
    Parse memoryPalace.ts and return a list of entry dicts:
      {'slug': str, 'canonical_name': str, 'aliases': list[str]}

    Uses line-by-line parsing. Matches the JS checker's logic exactly.
    """
    lines = source.splitlines()
    entries = []
    current: dict | None = None
    in_aliases = False
    alias_buffer = ""

    for line in lines:
        # Detect slug — always the first field in each entry
        slug_m = re.match(r"\s+slug:\s*['\"]([^'\"]+)['\"]", line)
        if slug_m:
            if current and current.get("canonical_name"):
                entries.append(current)
            current = {"slug": slug_m.group(1), "canonical_name": None, "aliases": []}
            in_aliases = False
            alias_buffer = ""
            continue

        if current is None:
            continue

        # canonical_name
        canon_m = re.match(r"\s+canonical_name:\s*(.+)", line)
        if canon_m:
            vals = extract_string_values(canon_m.group(1).rstrip(","))
            if vals:
                current["canonical_name"] = vals[0]
            continue

        # aliases: [ ... ]  — may be single-line or multiline
        aliases_start_m = re.match(r"\s+aliases:\s*\[(.*)$", line)
        if aliases_start_m:
            rest = aliases_start_m.group(1)
            if "]" in rest:
                inner = rest[: rest.index("]")]
                current["aliases"] = extract_string_values(inner)
            else:
                in_aliases = True
                alias_buffer = rest
            continue

        if in_aliases:
            if "]" in line:
                alias_buffer += line[: line.index("]")]
                current["aliases"] = extract_string_values(alias_buffer)
                in_aliases = False
                alias_buffer = ""
            else:
                alias_buffer += line

    if current and current.get("canonical_name"):
        entries.append(current)

    return entries


# ---------------------------------------------------------------------------
# Collision detection
# ---------------------------------------------------------------------------

def detect_collisions(entries: list[dict]) -> list[dict]:
    """
    Build a lowercase key map and return collision descriptors:
      {'key': str, 'first': dict, 'second': dict}
    """
    seen: dict[str, dict] = {}
    collisions = []

    for entry in entries:
        slug = entry["slug"]
        all_names = [("canonical_name", entry["canonical_name"])] + [
            ("alias", a) for a in entry["aliases"]
        ]

        for field, value in all_names:
            key = value.lower()
            if key in seen:
                collisions.append(
                    {"key": key, "first": seen[key], "second": {"slug": slug, "field": field, "value": value}}
                )
            else:
                seen[key] = {"slug": slug, "field": field, "value": value}

    return collisions


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Check Memory Palace alias collisions")
    parser.add_argument("--path", type=Path, default=None, help="Path to memoryPalace.ts")
    parser.add_argument("--verbose", action="store_true", help="Show all entries parsed")
    args = parser.parse_args()

    path = args.path or default_palace_path()

    if not path.exists():
        sys.stderr.write(f"ERROR: memoryPalace.ts not found at: {path}\n")
        return 2

    source = path.read_text(encoding="utf-8")

    try:
        entries = parse_entries(source)
    except Exception as exc:
        sys.stderr.write(f"ERROR: Failed to parse {path}: {exc}\n")
        return 2

    if args.verbose:
        for e in entries:
            print(f"  {e['slug']}: canonical={e['canonical_name']!r}, aliases={e['aliases']}")

    collisions = detect_collisions(entries)

    if not collisions:
        print(f"✓ Memory Palace: {len(entries)} entries, no alias collisions")
        return 0

    sys.stderr.write(f"✗ Memory Palace alias collision(s) detected:\n\n")
    for c in collisions:
        sys.stderr.write(
            f"  Key: {c['key']!r}\n"
            f"    → {c['first']['field']} {c['first']['value']!r} (slug: {c['first']['slug']})\n"
            f"    → {c['second']['field']} {c['second']['value']!r} (slug: {c['second']['slug']})\n\n"
        )
    sys.stderr.write(
        "Fix: remove the redundant alias or rename the canonical_name.\n"
        f"See: {path}\n"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
