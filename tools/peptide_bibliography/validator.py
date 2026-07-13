#!/usr/bin/env python3
"""Peptide Science Bibliography Registry Validator.

Validates a registry JSON file against the source-entry and registry schemas.
Uses stdlib only (json, pathlib, re).
"""

import json
import re
import sys
from pathlib import Path


SCHEMA_DIR = Path(__file__).resolve().parent.parent.parent / "peptide-science" / "schemas"
SOURCE_ID_PATTERN = re.compile(r"^PEP-[A-Z0-9]+(-[A-Z0-9]+)*-[0-9]{4}$")
REQUIRED_FIELDS = [
    "source_id",
    "title",
    "source_type",
    "authority_posture",
    "primary_or_secondary",
    "accessed_date",
]
VALID_SOURCE_TYPES = {
    "primary_research", "review", "official_historical", "regulatory",
    "standard", "database", "ontology", "nomenclature", "textbook",
    "local_receipt", "discovery_aid",
}
VALID_AUTHORITY_POSTURES = {
    "primary_experimental", "primary_historical", "official_regulatory",
    "official_standards", "community_consensus", "peer_reviewed",
    "tertiary", "local_execution", "discovery_aid",
}
VALID_PRIMARY_OR_SECONDARY = {"primary", "secondary", "tertiary"}
VALID_DOCUMENT_STATUS = {
    "active", "draft", "superseded", "retracted", "corrected", "archived",
}
VALID_RETRACTION_STATUS = {
    "none", "retracted", "corrected", "expression_of_concern", "superseded",
}


def validate_source_entry(entry: dict, errors: list, warnings: list, idx: int) -> bool:
    """Validate a single source entry. Returns True if valid."""
    valid = True
    prefix = f"source[{idx}]"

    for field in REQUIRED_FIELDS:
        if field not in entry:
            errors.append(f"{prefix}: missing required field '{field}'")
            valid = False

    sid = entry.get("source_id", "")
    if sid and not SOURCE_ID_PATTERN.match(sid):
        errors.append(f"{prefix}: source_id '{sid}' does not match pattern PEP-XXXX-YYYY")
        valid = False

    st = entry.get("source_type", "")
    if st and st not in VALID_SOURCE_TYPES:
        errors.append(f"{prefix}: invalid source_type '{st}'")
        valid = False

    ap = entry.get("authority_posture", "")
    if ap and ap not in VALID_AUTHORITY_POSTURES:
        errors.append(f"{prefix}: invalid authority_posture '{ap}'")
        valid = False

    ps = entry.get("primary_or_secondary", "")
    if ps and ps not in VALID_PRIMARY_OR_SECONDARY:
        errors.append(f"{prefix}: invalid primary_or_secondary '{ps}'")
        valid = False

    ds = entry.get("document_status", "")
    if ds and ds not in VALID_DOCUMENT_STATUS:
        errors.append(f"{prefix}: invalid document_status '{ds}'")
        valid = False

    rs = entry.get("retraction_or_correction_status", "")
    if rs and rs not in VALID_RETRACTION_STATUS:
        errors.append(f"{prefix}: invalid retraction_or_correction_status '{rs}'")
        valid = False

    doi = entry.get("doi", "")
    if doi and not doi.startswith("10."):
        errors.append(f"{prefix}: doi '{doi}' does not start with '10.'")
        valid = False

    year = entry.get("year")
    if year is not None and (not isinstance(year, int) or year < 1800 or year > 2030):
        errors.append(f"{prefix}: year {year} out of range (1800-2030)")
        valid = False

    if entry.get("source_type") == "regulatory":
        if not entry.get("jurisdiction"):
            warnings.append(f"{prefix}: regulatory source missing jurisdiction")
        if not entry.get("issued_date"):
            warnings.append(f"{prefix}: regulatory source missing issued_date")

    if entry.get("source_type") == "database":
        if not entry.get("version_or_release"):
            warnings.append(f"{prefix}: database source missing version_or_release")

    return valid


def validate_registry(data: dict) -> tuple[list, list]:
    """Validate a registry dict. Returns (errors, warnings)."""
    errors: list[str] = []
    warnings: list[str] = []

    if data.get("registry_id") != "PEP-BIB-REGISTRY":
        errors.append("registry_id must be 'PEP-BIB-REGISTRY'")

    version = data.get("version", "")
    if not re.match(r"^v\d+\.\d+$", version):
        errors.append(f"version '{version}' does not match pattern vX.Y")

    sources = data.get("sources", [])
    if not isinstance(sources, list):
        errors.append("sources must be an array")
        return errors, warnings

    seen_ids: set[str] = set()
    for i, entry in enumerate(sources):
        if not isinstance(entry, dict):
            errors.append(f"source[{i}]: not an object")
            continue
        validate_source_entry(entry, errors, warnings, i)
        sid = entry.get("source_id", "")
        if sid in seen_ids:
            errors.append(f"source[{i}]: duplicate source_id '{sid}'")
        seen_ids.add(sid)

    return errors, warnings


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python -m tools.peptide_bibliography.validator <registry.json>", file=sys.stderr)
        return 2

    registry_path = Path(sys.argv[1])
    if not registry_path.exists():
        print(f"ERROR: File not found: {registry_path}", file=sys.stderr)
        return 2

    data = json.loads(registry_path.read_text(encoding="utf-8"))
    errors, warnings = validate_registry(data)

    if warnings:
        for w in warnings:
            print(f"WARN: {w}", file=sys.stderr)

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)", file=sys.stderr)
        return 1

    print(f"OK: {len(data.get('sources', []))} sources validated, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
