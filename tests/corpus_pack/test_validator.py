"""Tests for the corpus pack validator."""

from __future__ import annotations

import unittest

from tools.corpus_pack.validator import (
    validate_answer_key,
    validate_packet,
    validate_source_manifest,
    validate_task,
)


class TestValidateSourceManifest(unittest.TestCase):
    def test_valid_source(self) -> None:
        source = {
            "source_id": "S001",
            "title": "Test Source",
            "author_or_organization": "Test Author",
            "source_type": "paper",
            "publication_date": "2026-01-01",
            "version_or_edition": "v1",
            "effective_date": "2026-01-01",
            "retrieval_date": "2026-07-13",
            "canonical_url_or_locator": "https://example.com/source",
            "license_or_rights_posture": "cc_by",
            "public_domain_status": False,
            "content_hash": "sha256:abc123",
            "source_authority_roles": ["primary"],
            "quality_flags": ["high_quality"],
            "privacy_or_sensitivity": "public_safe",
            "citation_format": "APA",
        }
        result = validate_source_manifest(source)
        self.assertTrue(result["valid"])
        self.assertEqual(len(result["errors"]), 0)

    def test_missing_required_field(self) -> None:
        source = {"source_id": "S001"}
        result = validate_source_manifest(source)
        self.assertFalse(result["valid"])
        self.assertGreater(len(result["errors"]), 0)

    def test_prohibited_pattern_detected(self) -> None:
        source = {
            "source_id": "S001",
            "title": "Test",
            "author_or_organization": "Test",
            "source_type": "paper",
            "publication_date": "2026-01-01",
            "version_or_edition": "v1",
            "effective_date": "2026-01-01",
            "retrieval_date": "2026-07-13",
            "canonical_url_or_locator": "https://example.com",
            "license_or_rights_posture": "cc_by",
            "public_domain_status": False,
            "content_hash": "sha256:abc",
            "source_authority_roles": ["primary"],
            "quality_flags": [],
            "privacy_or_sensitivity": "public_safe",
            "citation_format": "APA",
            "notes": "api_key=sk-12345",
        }
        result = validate_source_manifest(source)
        self.assertFalse(result["valid"])

    def test_invalid_privacy(self) -> None:
        source = {
            "source_id": "S001",
            "title": "Test",
            "author_or_organization": "Test",
            "source_type": "paper",
            "publication_date": "2026-01-01",
            "version_or_edition": "v1",
            "effective_date": "2026-01-01",
            "retrieval_date": "2026-07-13",
            "canonical_url_or_locator": "https://example.com",
            "license_or_rights_posture": "cc_by",
            "public_domain_status": False,
            "content_hash": "sha256:abc",
            "source_authority_roles": ["primary"],
            "quality_flags": [],
            "privacy_or_sensitivity": "invalid_value",
            "citation_format": "APA",
        }
        result = validate_source_manifest(source)
        self.assertFalse(result["valid"])


class TestValidateTask(unittest.TestCase):
    def test_valid_task(self) -> None:
        task = {
            "task_id": "T001",
            "packet_id": "P001",
            "task_type": "entity_resolution",
            "source_ids": ["S001", "S002"],
            "ground_truth": {
                "supported_claims": [{"claim": "test"}],
                "unsupported_tempting_claims": [],
            },
            "scoring_dimensions": ["factual_precision"],
        }
        result = validate_task(task)
        self.assertTrue(result["valid"])

    def test_missing_ground_truth_fields(self) -> None:
        task = {
            "task_id": "T001",
            "packet_id": "P001",
            "task_type": "entity_resolution",
            "source_ids": ["S001"],
            "ground_truth": {},
            "scoring_dimensions": [],
        }
        result = validate_task(task)
        self.assertFalse(result["valid"])

    def test_invalid_task_type(self) -> None:
        task = {
            "task_id": "T001",
            "packet_id": "P001",
            "task_type": "invalid_type",
            "source_ids": [],
            "ground_truth": {
                "supported_claims": [],
                "unsupported_tempting_claims": [],
            },
            "scoring_dimensions": [],
        }
        result = validate_task(task)
        self.assertFalse(result["valid"])


class TestValidateAnswerKey(unittest.TestCase):
    def test_valid_answer_key(self) -> None:
        ak = {
            "task_id": "T001",
            "correct_answer": {"answer": "yes"},
            "acceptable_alternatives": [],
            "required_citations": ["S001"],
            "human_reviewer": "reviewer@example.com",
            "review_date": "2026-07-13",
        }
        result = validate_answer_key(ak)
        self.assertTrue(result["valid"])

    def test_missing_required_field(self) -> None:
        ak = {"task_id": "T001"}
        result = validate_answer_key(ak)
        self.assertFalse(result["valid"])

    def test_no_human_reviewer_warning(self) -> None:
        ak = {
            "task_id": "T001",
            "correct_answer": {},
            "acceptable_alternatives": [],
            "required_citations": [],
        }
        result = validate_answer_key(ak)
        self.assertTrue(result["valid"])
        self.assertGreater(len(result["warnings"]), 0)


class TestValidatePacket(unittest.TestCase):
    def test_valid_packet(self) -> None:
        sources = [
            {
                "source_id": "S001",
                "title": "Source 1",
                "author_or_organization": "Author",
                "source_type": "paper",
                "publication_date": "2026-01-01",
                "version_or_edition": "v1",
                "effective_date": "2026-01-01",
                "retrieval_date": "2026-07-13",
                "canonical_url_or_locator": "https://example.com",
                "license_or_rights_posture": "cc_by",
                "public_domain_status": False,
                "content_hash": "sha256:abc",
                "source_authority_roles": ["primary"],
                "quality_flags": [],
                "privacy_or_sensitivity": "public_safe",
                "citation_format": "APA",
            }
        ]
        tasks = [
            {
                "task_id": "T001",
                "packet_id": "P001",
                "task_type": "entity_resolution",
                "source_ids": ["S001"],
                "ground_truth": {
                    "supported_claims": [],
                    "unsupported_tempting_claims": [],
                },
                "scoring_dimensions": ["factual_precision"],
            }
        ]
        answer_keys = [
            {
                "task_id": "T001",
                "correct_answer": {},
                "acceptable_alternatives": [],
                "required_citations": ["S001"],
                "human_reviewer": "reviewer",
                "review_date": "2026-07-13",
            }
        ]
        result = validate_packet(sources, tasks, answer_keys)
        self.assertTrue(result["valid"])

    def test_missing_answer_key_for_task(self) -> None:
        sources = []
        tasks = [
            {
                "task_id": "T001",
                "packet_id": "P001",
                "task_type": "entity_resolution",
                "source_ids": [],
                "ground_truth": {
                    "supported_claims": [],
                    "unsupported_tempting_claims": [],
                },
                "scoring_dimensions": [],
            }
        ]
        answer_keys = []
        result = validate_packet(sources, tasks, answer_keys)
        self.assertFalse(result["valid"])

    def test_task_references_missing_source(self) -> None:
        sources = []
        tasks = [
            {
                "task_id": "T001",
                "packet_id": "P001",
                "task_type": "entity_resolution",
                "source_ids": ["S_NONEXISTENT"],
                "ground_truth": {
                    "supported_claims": [],
                    "unsupported_tempting_claims": [],
                },
                "scoring_dimensions": [],
            }
        ]
        answer_keys = [
            {
                "task_id": "T001",
                "correct_answer": {},
                "acceptable_alternatives": [],
                "required_citations": [],
                "human_reviewer": "r",
                "review_date": "2026-07-13",
            }
        ]
        result = validate_packet(sources, tasks, answer_keys)
        self.assertFalse(result["valid"])


if __name__ == "__main__":
    unittest.main()
