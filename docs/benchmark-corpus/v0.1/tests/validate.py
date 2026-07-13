#!/usr/bin/env python3
"""Benchmark Corpus Pack validator v0.1.

Validates source manifests and task answer keys against schemas and
enforces semantic rules:

- Restricted sources cannot be public_safe
- Retracted sources must have known_corrections_or_retractions entries
- insufficient_evidence tasks must have empty supported_claims
- rejection_expected uncertainty requires empty supported_claims
- multi_source_distant reading requires 2+ required_citations
- contradiction_resolution tasks must have contradictory_evidence

Uses only Python stdlib.
"""

import json
import sys
from pathlib import Path


def validate_source_manifest(record: dict) -> list[str]:
    errors = []
    required = [
        "schema_version", "source_id", "title", "author_or_organization",
        "source_type", "publication_date", "version_or_edition",
        "effective_date", "retrieval_date", "canonical_url_or_locator",
        "license_or_rights_posture", "public_domain_status", "content_hash",
        "source_authority_roles", "quality_flags", "privacy_or_sensitivity"
    ]
    for field in required:
        if field not in record:
            errors.append(f"Missing required field: {field}")
    if errors:
        return errors

    # Restricted sources cannot be public_safe
    if record.get("privacy_or_sensitivity") == "restricted":
        if record.get("license_or_rights_posture") == "restricted":
            errors.append(
                "Source is restricted — cannot be included in public-safe benchmark"
            )

    # Retracted sources must have corrections recorded
    if "retracted" in record.get("quality_flags", []):
        if not record.get("known_corrections_or_retractions"):
            errors.append(
                "Source has 'retracted' quality flag but no known_corrections_or_retractions"
            )

    # Superseded sources must have corrections recorded
    if "superseded" in record.get("quality_flags", []):
        if not record.get("known_corrections_or_retractions"):
            errors.append(
                "Source has 'superseded' quality flag but no known_corrections_or_retractions"
            )

    # Empty content_hash is invalid
    if not record.get("content_hash"):
        errors.append("content_hash is empty")

    # Empty source_authority_roles is invalid
    if not record.get("source_authority_roles"):
        errors.append("source_authority_roles is empty — must have at least one role")

    return errors


def validate_task_answer_key(record: dict) -> list[str]:
    errors = []
    required = [
        "schema_version", "task_id", "packet_id", "task_type", "question",
        "supported_claims", "unsupported_tempting_claims", "required_citations",
        "acceptable_uncertainty", "hallucination_traps", "reading_requirement"
    ]
    for field in required:
        if field not in record:
            errors.append(f"Missing required field: {field}")
    if errors:
        return errors

    task_type = record.get("task_type", "")
    uncertainty = record.get("acceptable_uncertainty", "")
    supported = record.get("supported_claims", [])
    citations = record.get("required_citations", [])
    contradictions = record.get("contradictory_evidence", [])

    # insufficient_evidence tasks must have empty supported_claims
    if task_type == "insufficient_evidence":
        if supported:
            errors.append(
                f"task_type is 'insufficient_evidence' but supported_claims is non-empty ({len(supported)} claims)"
            )

    # rejection_expected uncertainty requires empty supported_claims
    if uncertainty == "rejection_expected":
        if supported:
            errors.append(
                f"acceptable_uncertainty is 'rejection_expected' but supported_claims is non-empty"
            )

    # multi_source_distant reading requires 2+ required_citations
    if record.get("reading_requirement") == "multi_source_distant":
        if len(citations) < 2:
            errors.append(
                f"reading_requirement is 'multi_source_distant' but only {len(citations)} required_citation(s) "
                f"(need >= 2)"
            )

    # contradiction_resolution tasks must have contradictory_evidence
    if task_type == "contradiction_resolution":
        if not contradictions:
            errors.append(
                "task_type is 'contradiction_resolution' but contradictory_evidence is empty"
            )

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate.py <record.json> [--source|--task] [...]", file=sys.stderr)
        return 2

    args = sys.argv[1:]
    mode = None
    paths = []
    for arg in args:
        if arg == "--source":
            mode = "source"
        elif arg == "--task":
            mode = "task"
        else:
            paths.append(arg)

    all_valid = True
    for path in paths:
        with open(path, encoding="utf-8") as f:
            record = json.load(f)

        # Auto-detect mode from schema_version if not specified
        if mode is None:
            sv = record.get("schema_version", "")
            if "source_manifest" in sv:
                errors = validate_source_manifest(record)
            elif "task_answer_key" in sv:
                errors = validate_task_answer_key(record)
            else:
                errors = [f"Unknown schema_version: {sv}"]
        elif mode == "source":
            errors = validate_source_manifest(record)
        elif mode == "task":
            errors = validate_task_answer_key(record)
        else:
            errors = ["Unknown mode"]

        if errors:
            all_valid = False
            print(f"INVALID: {path}")
            for e in errors:
                print(f"  - {e}")
        else:
            print(f"VALID: {path}")
    return 0 if all_valid else 1


if __name__ == "__main__":
    sys.exit(main())
