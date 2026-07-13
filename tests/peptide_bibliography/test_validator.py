"""Tests for the peptide bibliography validator."""

import json
import sys
from pathlib import Path

import pytest

# Add tools to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from tools.peptide_bibliography.validator import (
    validate_registry,
    validate_source_entry,
)

FIXTURES = Path(__file__).resolve().parent.parent.parent / "peptide-science" / "fixtures"
REGISTRY = Path(__file__).resolve().parent.parent.parent / "peptide-science" / "sources" / "registry.json"


class TestSourceEntryValidation:
    def test_valid_entry(self):
        entry = json.loads((FIXTURES / "valid" / "valid_entry.json").read_text(encoding="utf-8"))
        errors, warnings = [], []
        assert validate_source_entry(entry, errors, warnings, 0)
        assert len(errors) == 0

    def test_missing_source_type(self):
        entry = json.loads((FIXTURES / "invalid" / "missing_source_type.json").read_text(encoding="utf-8"))
        errors, warnings = [], []
        validate_source_entry(entry, errors, warnings, 0)
        assert any("source_type" in e for e in errors)

    def test_malformed_id(self):
        entry = json.loads((FIXTURES / "invalid" / "malformed_id.json").read_text(encoding="utf-8"))
        errors, warnings = [], []
        validate_source_entry(entry, errors, warnings, 0)
        assert any("source_id" in e for e in errors)

    def test_regulatory_missing_jurisdiction_warns(self):
        entry = json.loads((FIXTURES / "invalid" / "regulatory_missing_status.json").read_text(encoding="utf-8"))
        errors, warnings = [], []
        validate_source_entry(entry, errors, warnings, 0)
        assert any("jurisdiction" in w for w in warnings)
        assert any("issued_date" in w for w in warnings)

    def test_invalid_doi(self):
        entry = {
            "source_id": "PEP-TEST-1900",
            "title": "Test",
            "source_type": "primary_research",
            "authority_posture": "primary_experimental",
            "primary_or_secondary": "primary",
            "doi": "not-a-doi",
            "accessed_date": "2026-07-10",
        }
        errors, warnings = [], []
        validate_source_entry(entry, errors, warnings, 0)
        assert any("doi" in e for e in errors)

    def test_year_out_of_range(self):
        entry = {
            "source_id": "PEP-TEST-1700",
            "title": "Test",
            "year": 1700,
            "source_type": "primary_research",
            "authority_posture": "primary_experimental",
            "primary_or_secondary": "primary",
            "accessed_date": "2026-07-10",
        }
        errors, warnings = [], []
        validate_source_entry(entry, errors, warnings, 0)
        assert any("year" in e for e in errors)


class TestRegistryValidation:
    def test_registry_loads_and_validates(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        errors, warnings = validate_registry(data)
        assert len(errors) == 0, f"Registry has errors: {errors}"

    def test_registry_has_seed_sources(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        sources = data["sources"]
        assert len(sources) >= 20, f"Expected >=20 seed sources, got {len(sources)}"

    def test_registry_has_required_seed(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        ids = {s["source_id"] for s in data["sources"]}
        required = {
            "PEP-IUPAC-2013",
            "PEP-BAYLISS-1902",
            "PEP-NOBEL-INSULIN-1923",
            "PEP-SANGER-1955",
            "PEP-DUVIGNEAUD-1953",
            "PEP-MERRIFIELD-1963",
            "PEP-EDMAN-1950",
            "PEP-YALOW-1960",
            "PEP-SMITH-1985",
            "PEP-DAWSON-1994",
            "PEP-ROBERTS-1997",
            "PEP-HUNT-1992",
            "PEP-ARNOLD-2013",
            "PEP-ZHANG-1993",
            "PEP-KLEIFELD-2010",
            "PEP-ANDERSON-2015",
            "PEP-HARTRAMPF-2020",
            "PEP-PROFORMA-2024",
            "PEP-HUPOPSI-2024",
            "PEP-FAIR-2016",
            "PEP-PROVO-2013",
            "PEP-FDA-PEPTIDE-2024",
        }
        missing = required - ids
        assert not missing, f"Missing required seed sources: {missing}"

    def test_no_duplicate_ids(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        ids = [s["source_id"] for s in data["sources"]]
        assert len(ids) == len(set(ids)), "Duplicate source_ids found"

    def test_regulatory_sources_have_jurisdiction(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        for s in data["sources"]:
            if s["source_type"] == "regulatory":
                assert s.get("jurisdiction"), f"Regulatory source {s['source_id']} missing jurisdiction"

    def test_database_sources_have_version(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        for s in data["sources"]:
            if s["source_type"] == "database":
                assert s.get("version_or_release"), f"Database source {s['source_id']} missing version_or_release"

    def test_discovery_aid_not_primary(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        for s in data["sources"]:
            if s["source_type"] == "discovery_aid":
                assert s["primary_or_secondary"] != "primary", \
                    f"Discovery aid {s['source_id']} marked as primary"

    def test_invalid_registry_id(self):
        data = {"registry_id": "WRONG", "version": "v0.1", "sources": []}
        errors, warnings = validate_registry(data)
        assert any("registry_id" in e for e in errors)

    def test_invalid_version_format(self):
        data = {"registry_id": "PEP-BIB-REGISTRY", "version": "0.1", "sources": []}
        errors, warnings = validate_registry(data)
        assert any("version" in e for e in errors)


class TestValidatorCLI:
    def test_validator_runs_on_registry(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, "-m", "tools.peptide_bibliography.validator", str(REGISTRY)],
            capture_output=True, text=True, cwd=REGISTRY.parent.parent.parent,
        )
        assert result.returncode == 0, f"Validator failed: {result.stderr}"
        assert "OK:" in result.stdout
