#!/usr/bin/env python3
"""Tests for the Benchmark Corpus Pack validator."""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from validate import validate_source_manifest, validate_task_answer_key

FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


def load_fixture(name: str) -> dict:
    with open(FIXTURES_DIR / name, encoding="utf-8") as f:
        return json.load(f)


class TestValidSourceManifests(unittest.TestCase):
    def test_valid_source_manifest(self):
        errors = validate_source_manifest(load_fixture("valid-source-manifest.json"))
        self.assertEqual(errors, [], f"Expected no errors: {errors}")

    def test_valid_source_manifest_corrected(self):
        errors = validate_source_manifest(load_fixture("valid-source-manifest-corrected.json"))
        self.assertEqual(errors, [], f"Expected no errors: {errors}")


class TestInvalidSourceManifests(unittest.TestCase):
    def test_invalid_restricted_source(self):
        errors = validate_source_manifest(load_fixture("invalid-restricted-source.json"))
        self.assertTrue(any("restricted" in e.lower() for e in errors),
                        f"Expected restricted error: {errors}")
        self.assertTrue(any("content_hash" in e for e in errors),
                        f"Expected content_hash error: {errors}")
        self.assertTrue(any("source_authority_roles" in e for e in errors),
                        f"Expected authority roles error: {errors}")


class TestValidTaskAnswerKeys(unittest.TestCase):
    def test_valid_task_answer_key(self):
        errors = validate_task_answer_key(load_fixture("valid-task-answer-key.json"))
        self.assertEqual(errors, [], f"Expected no errors: {errors}")

    def test_valid_task_contradiction(self):
        errors = validate_task_answer_key(load_fixture("valid-task-contradiction.json"))
        self.assertEqual(errors, [], f"Expected no errors: {errors}")

    def test_valid_task_insufficient(self):
        errors = validate_task_answer_key(load_fixture("valid-task-insufficient.json"))
        self.assertEqual(errors, [], f"Expected no errors: {errors}")


class TestSemanticRules(unittest.TestCase):
    def test_insufficient_evidence_must_have_empty_supported(self):
        r = {
            "schema_version": "benchmark_task_answer_key.v0.1",
            "task_id": "t1", "packet_id": "p1",
            "task_type": "insufficient_evidence",
            "question": "q",
            "supported_claims": [{"claim": "x", "evidence_source_ids": ["s1"], "confidence": "high"}],
            "unsupported_tempting_claims": [],
            "required_citations": [],
            "acceptable_uncertainty": "low",
            "hallucination_traps": [],
            "reading_requirement": "exhaustive"
        }
        errors = validate_task_answer_key(r)
        self.assertTrue(any("insufficient_evidence" in e for e in errors))

    def test_rejection_expected_requires_empty_supported(self):
        r = {
            "schema_version": "benchmark_task_answer_key.v0.1",
            "task_id": "t1", "packet_id": "p1",
            "task_type": "insufficient_evidence",
            "question": "q",
            "supported_claims": [{"claim": "x", "evidence_source_ids": ["s1"], "confidence": "high"}],
            "unsupported_tempting_claims": [],
            "required_citations": [],
            "acceptable_uncertainty": "rejection_expected",
            "hallucination_traps": [],
            "reading_requirement": "exhaustive"
        }
        errors = validate_task_answer_key(r)
        self.assertTrue(any("rejection_expected" in e for e in errors))

    def test_multi_source_distant_needs_2_citations(self):
        r = {
            "schema_version": "benchmark_task_answer_key.v0.1",
            "task_id": "t1", "packet_id": "p1",
            "task_type": "multi_hop_synthesis",
            "question": "q",
            "supported_claims": [],
            "unsupported_tempting_claims": [],
            "required_citations": ["s1"],
            "acceptable_uncertainty": "low",
            "hallucination_traps": [],
            "reading_requirement": "multi_source_distant"
        }
        errors = validate_task_answer_key(r)
        self.assertTrue(any("multi_source_distant" in e for e in errors))

    def test_contradiction_resolution_needs_contradictions(self):
        r = {
            "schema_version": "benchmark_task_answer_key.v0.1",
            "task_id": "t1", "packet_id": "p1",
            "task_type": "contradiction_resolution",
            "question": "q",
            "supported_claims": [],
            "unsupported_tempting_claims": [],
            "required_citations": ["s1", "s2"],
            "acceptable_uncertainty": "low",
            "hallucination_traps": [],
            "reading_requirement": "multi_source_distant",
            "contradictory_evidence": []
        }
        errors = validate_task_answer_key(r)
        self.assertTrue(any("contradiction_resolution" in e for e in errors))

    def test_retracted_without_corrections_fails(self):
        r = {
            "schema_version": "benchmark_source_manifest.v0.1",
            "source_id": "s1", "title": "t", "author_or_organization": "a",
            "source_type": "journal_article", "publication_date": "2025-01-01",
            "version_or_edition": "v1", "effective_date": None,
            "retrieval_date": "2026-07-10", "canonical_url_or_locator": "x",
            "license_or_rights_posture": "cc-by-4.0",
            "public_domain_status": "not_public_domain",
            "content_hash": "sha256:abc",
            "source_authority_roles": ["primary_source"],
            "quality_flags": ["retracted"],
            "privacy_or_sensitivity": "public_safe",
            "known_corrections_or_retractions": []
        }
        errors = validate_source_manifest(r)
        self.assertTrue(any("retracted" in e.lower() for e in errors))


if __name__ == "__main__":
    unittest.main()
