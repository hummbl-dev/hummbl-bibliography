# Changelog

All notable changes to the HUMMBL Bibliography will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added

#### Bibliography
- Initial bibliography with 48 curated entries
- 17 canonical works (T1) covering foundational theories
- 16 empirical research papers (T2) with rigorous peer review
- 15 applied practitioner texts (T3) for industry applications
- Complete HUMMBL transformation mappings for all entries
- 100% abstract coverage across all entries
- 29% DOI coverage, 73% ISBN coverage

#### Toolkit
- `validate.js`: Comprehensive BibTeX validation with error/warning reports
- `check-duplicates.js`: Cross-file duplicate detection by title, DOI, and ISBN
- `fix-duplicates.js`: Automated duplicate removal with tier prioritization
- `find-missing-dois.js`: DOI enrichment via CrossRef API integration
- `stats.js`: Analytics dashboard with transformation coverage metrics
- `extract-keywords.js`: HUMMBL transformation keyword extraction and analysis
- `merge-entries.js`: Interactive entry consolidation tool
- NPM scripts for all toolkit operations
- CI mode for automated validation

#### Documentation
- Comprehensive README.md with quick start guide
- CONTRIBUTING.md with detailed contribution guidelines
- TRANSFORMATION_GUIDE.md explaining the six HUMMBL transformations
- QUALITY_STANDARDS.md defining entry requirements and formatting
- GAP_ANALYSIS.md tracking coverage gaps and priorities
- Toolkit README.md with tool documentation

#### Automation
- GitHub Actions workflow for PR validation
- Weekly statistics report generation workflow
- Manual DOI enrichment workflow
- Pre-commit hooks using Husky for validation
- Setup script for Git hook configuration
- Monthly review script for automated reporting

#### Project Infrastructure
- Issue templates for new entries and quality improvements
- Three-tier directory structure (T1/T2/T3)
- HUMMBL transformation mapping schema (JSON)
- Reports directory for generated statistics
- MIT License

### Transformation Coverage

Current distribution:
- **SY (Synthesis)**: 20 entries
- **CO (Composition)**: 18 entries  
- **P (Perspective)**: 17 entries
- **RE (Recursion)**: 16 entries
- **IN (Inversion)**: 15 entries
- **DE (Decomposition)**: 12 entries

### Quality Metrics

- ✅ 100% entries have abstracts
- ✅ 100% entries have HUMMBL transformation keywords
- ✅ 0 validation errors
- ✅ 0 duplicate entries
- ⚠️ 29% DOI coverage (target: 40-50%)
- ⚠️ 73% ISBN coverage (target: 85-90%)

### Known Issues

- DOI coverage below target (planned improvement in Q1 2025)
- Decomposition (DE) transformation underrepresented (4-6 entries needed)
- Inversion (IN) transformation slightly below target (1-3 entries needed)

## [Unreleased]

### Planned for v1.1.0 (Q2 2025)

- Increase DOI coverage to 40%
- Add 4-6 Decomposition (DE) entries
- Add 1-3 Inversion (IN) entries
- Implement watch mode for continuous validation
- Add export to multiple citation formats
- Enhanced statistics visualization

### Planned for v1.2.0 (Q3 2025)

- Web dashboard for browsing bibliography
- Interactive TUI for entry management
- Network graph visualization of citations
- Automated relevance scoring
- Reading list generator
- Enhanced DOI enrichment with multiple sources

### Future Considerations

- Integration with Zotero/Mendeley
- Citation relationship analysis
- Automated entry suggestions based on gaps
- Community contribution portal
- Multi-language support
- API for programmatic access

---

**Note**: This changelog follows semantic versioning. Given the nature of a bibliography:
- **MAJOR** versions indicate significant structural changes or complete reorganizations
- **MINOR** versions indicate new entries, new tools, or significant enhancements
- **PATCH** versions indicate fixes to existing entries or minor improvements

For detailed commit history, see: https://github.com/hummbl-dev/hummbl-bibliography/commits/main
