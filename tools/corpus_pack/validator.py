"""Deterministic pack validator for corpus pack v0.1.

Validates that source manifests, tasks, and answer keys conform to
their schemas and that rights/privacy requirements are met.

Refs: hummbl-bibliography#78, hummbl-dev/hummbl-dev#155
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


REQUIRED_SOURCE_FIELDS = [
    "source_id",
    "title",
    "author_or_organization",
    "source_type",
    "publication_date",
    "version_or_edition",
    "effective_date",
    "retrieval_date",
    "canonical_url_or_locator",
    "license_or_rights_posture",
    "public_domain_status",
    "content_hash",
    "source_authority_roles",
    "quality_flags",
    "privacy_or_sensitivity",
    "citation_format",
]

REQUIRED_TASK_FIELDS = [
    "task_id",
    "packet_id",
    "task_type",
    "source_ids",
    "ground_truth",
    "scoring_dimensions",
]

REQUIRED_ANSWER_KEY_FIELDS = [
    "task_id",
    "correct_answer",
    "acceptable_alternatives",
    "required_citations",
]

PROHIBITED_PATTERNS = [
    "sk-",  # API keys
    "password",
    "secret",
    "token",
    "api_key",
    "apikey",
]


def validate_source_manifest(source: dict[str, Any]) -> dict[str, Any]:
    """Validate a single source manifest entry."""
    errors = []
    warnings = []

    for field in REQUIRED_SOURCE_FIELDS:
        if field not in source:
            errors.append(f"Missing required field: {field}")

    # Check privacy classification
    privacy = source.get("privacy_or_sensitivity", "")
    if privacy not in ("public_safe", "sensitive", "restricted"):
        errors.append(f"Invalid privacy_or_sensitivity: {privacy}")

    # Check for prohibited content
    source_str = json.dumps(source).lower()
    for pattern in PROHIBITED_PATTERNS:
        if pattern in source_str:
            errors.append(f"Prohibited pattern detected: {pattern}")

    # Check content hash format
    content_hash = source.get("content_hash", "")
    if content_hash and not content_hash.startswith("sha256:"):
        warnings.append("content_hash should ideally be prefixed with 'sha256:'")

    # Check public domain status
    if source.get("public_domain_status") is None:
        errors.append("public_domain_status must be boolean, not None")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def validate_task(task: dict[str, Any]) -> dict[str, Any]:
    """Validate a single task entry."""
    errors = []
    warnings = []

    for field in REQUIRED_TASK_FIELDS:
        if field not in task:
            errors.append(f"Missing required field: {field}")

    # Check ground truth
    gt = task.get("ground_truth", {})
    if "supported_claims" not in gt:
        errors.append("ground_truth missing supported_claims")
    if "unsupported_tempting_claims" not in gt:
        errors.append("ground_truth missing unsupported_tempting_claims")

    # Check task type
    task_type = task.get("task_type", "")
    valid_types = [
        "entity_resolution",
        "ocr_reasoning",
        "multi_hop_synthesis",
        "contradiction_detection",
        "insufficient_evidence",
        "temporal_reasoning",
        "authority_classification",
    ]
    if task_type and task_type not in valid_types:
        errors.append(f"Invalid task_type: {task_type}")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def validate_answer_key(answer_key: dict[str, Any]) -> dict[str, Any]:
    """Validate a single answer key entry."""
    errors = []
    warnings = []

    for field in REQUIRED_ANSWER_KEY_FIELDS:
        if field not in answer_key:
            errors.append(f"Missing required field: {field}")

    # Check for human reviewer
    if not answer_key.get("human_reviewer"):
        warnings.append("No human_reviewer specified — independent review recommended")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def validate_packet(
    sources: list[dict[str, Any]],
    tasks: list[dict[str, Any]],
    answer_keys: list[dict[str, Any]],
) -> dict[str, Any]:
    """Validate a complete benchmark packet."""
    all_errors = []
    all_warnings = []

    # Validate sources
    for i, source in enumerate(sources):
        result = validate_source_manifest(source)
        if not result["valid"]:
            all_errors.extend([f"Source {i}: {e}" for e in result["errors"]])
        all_warnings.extend([f"Source {i}: {w}" for w in result["warnings"]])

    # Validate tasks
    for i, task in enumerate(tasks):
        result = validate_task(task)
        if not result["valid"]:
            all_errors.extend([f"Task {i}: {e}" for e in result["errors"]])
        all_warnings.extend([f"Task {i}: {w}" for w in result["warnings"]])

    # Validate answer keys
    for i, ak in enumerate(answer_keys):
        result = validate_answer_key(ak)
        if not result["valid"]:
            all_errors.extend([f"AnswerKey {i}: {e}" for e in result["errors"]])
        all_warnings.extend([f"AnswerKey {i}: {w}" for w in result["warnings"]])

    # Cross-validation: every task has an answer key
    task_ids = {t.get("task_id") for t in tasks}
    ak_task_ids = {ak.get("task_id") for ak in answer_keys}
    missing_aks = task_ids - ak_task_ids
    if missing_aks:
        all_errors.append(f"Tasks without answer keys: {missing_aks}")

    # Cross-validation: every task's source_ids exist in sources
    source_ids = {s.get("source_id") for s in sources}
    for task in tasks:
        for sid in task.get("source_ids", []):
            if sid not in source_ids:
                all_errors.append(f"Task {task.get('task_id')}: source_id '{sid}' not found")

    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "warnings": all_warnings,
        "source_count": len(sources),
        "task_count": len(tasks),
        "answer_key_count": len(answer_keys),
    }
