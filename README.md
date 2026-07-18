# HUMMBL Bibliography

![Total Entries](https://img.shields.io/badge/entries-321-blue)
![DOI Coverage](https://img.shields.io/badge/DOIs-58%25-yellowgreen)
![ISBN Coverage](https://img.shields.io/badge/ISBNs-22%25-yellow)
![Abstract Coverage](https://img.shields.io/badge/abstracts-100%25-brightgreen)
![Validation](https://github.com/hummbl-dev/hummbl-bibliography/workflows/validate/badge.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/hummbl-dev/hummbl-bibliography/main)](https://github.com/hummbl-dev/hummbl-bibliography/commits/main)

A production-ready bibliography management system for the **HUMMBL (Base120) cognitive framework**. This repository maintains 321 curated academic and practitioner works across 19 canonical BibTeX files, including the original 13 thematic tiers, mapped to 6 cognitive transformations.

Learn more at [hummbl.io](https://hummbl.io).

## 🎯 Overview

The HUMMBL cognitive framework identifies six fundamental thinking operations:

- **P** (Perspective/Identity): Frame and name what is. Anchor or shift point of view.
- **IN** (Inversion): Reverse assumptions. Examine opposites, edges, negations.
- **CO** (Composition): Combine parts into coherent wholes.
- **DE** (Decomposition): Break complex systems into constituent parts.
- **RE** (Recursion): Apply operations iteratively, with outputs becoming inputs.
- **SY** (Meta-Systems): Understand systems of systems, coordination, and emergent dynamics.

This bibliography provides the theoretical foundation and empirical evidence for these transformations through carefully selected works spanning systems thinking, cognitive psychology, design, and organizational learning.

## 📚 Bibliography Structure

### Thematic Tiers

| Tier | Domain | Examples |
|------|--------|----------|
| **T1: Canonical** | Foundational theoretical works | Meadows, Kahneman, Simon, Pearl |
| **T2: Empirical** | Peer-reviewed research | Tversky & Kahneman, Klein, Gigerenzer |
| **T3: Applied** | Practitioner texts | Lean Startup, Design Thinking, DevOps |
| **T4: Agentic** | AI safety & multi-agent systems | Russell, Amodei, Constitutional AI |
| **T5: Engineering** | Software patterns for agents | Circuit breakers, stigmergy, BDI, DbC |
| **T6: Governance** | AI regulation & assurance | EU AI Act, NIST RMF, OWASP LLM Top 10 |
| **T7: Emerging** | Cutting-edge agent research | ReAct, CoT, RAG, SWE-bench, ToT |
| **T8: Cognition** | Mental models & knowledge | Craik, Piaget, Zettelkasten, CoP |
| **T9: Economics** | AI economics & platforms | Coase, Tirole, scaling laws, auctions |
| **T10: Collaboration** | Human-AI teaming | Licklider, CSCW, shared mental models |
| **T11: Security** | Adversarial ML & defense | Goodfellow, zero trust, formal verification |
| **T12: Complexity** | Complex adaptive systems | Holland, Kauffman, networks, cybernetics |
| **T13: Reasoning** | Advanced reasoning systems | o-series model cards, AlphaCode, Claude |

All 321 validated entries have abstracts (150-300 words) and HUMMBL transformation tags.

## 🚀 Quick Start

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/hummbl-dev/hummbl-bibliography.git
cd hummbl-bibliography

# Install toolkit dependencies
cd toolkit
npm install

# Validate bibliography
npm run validate

# View statistics
npm run stats
```

The root `package.json` is a private delegation shim. After installing
`toolkit/` dependencies, root commands such as `npm test`, `npm run validate`,
and `npm run stats` delegate to the toolkit package.

### Basic Usage

```bash
# Validate all bibliography files
npm run validate

# Check for duplicates
npm run check-dups

# Generate statistics report
npm run stats

# Extract HUMMBL transformation keywords
npm run keywords

# Find missing DOIs
npm run find-dois

# Run full test suite
npm test
```

## 📊 Current Metrics

Based on the validated corpus as of July 16, 2026:

- **Total Entries**: 321 unique works across 19 canonical BibTeX files
- **Transformation Coverage** (tag count across all entries):
  - SY (Synthesis): 132
  - P (Perspective): 120
  - CO (Composition): 119
  - RE (Recursion): 117
  - DE (Decomposition): 108
  - IN (Inversion): 101
- **Quality Metrics**:
  - 100% have abstracts (150-300 word scholarly annotations)
  - 100% have HUMMBL transformation mappings
  - 57.6% have DOIs (185/321)
  - 22.4% have ISBNs (72/321)
  - 0 validation errors, 0 duplicates

## 🔄 HUMMBL Transformation Mapping

Each bibliography entry is tagged with one or more HUMMBL transformations based on its primary cognitive contributions:

```bibtex
@book{Meadows2008ThinkingSystems,
  title = {Thinking in Systems: A Primer},
  author = {Meadows, Donella H.},
  year = {2008},
  publisher = {Chelsea Green Publishing},
  isbn = {978-1603580557},
  abstract = {...},
  keywords = {systems thinking, HUMMBL:SY, HUMMBL:RE, HUMMBL:CO}
}
```

For detailed guidance on mapping new entries, see [docs/TRANSFORMATION_GUIDE.md](docs/TRANSFORMATION_GUIDE.md).

## 🛠️ Toolkit

The repository includes a comprehensive Node.js toolkit for bibliography management:

| Script | Purpose |
|--------|---------|
| `validate.js` | Full validation with error/warning reports |
| `check-duplicates.js` | Cross-file duplicate detection |
| `fix-duplicates.js` | Automatic duplicate removal |
| `find-missing-dois.js` | DOI enrichment via CrossRef API |
| `stats.js` | Analytics dashboard with transformation coverage |
| `extract-keywords.js` | HUMMBL transformation keyword extraction |
| `merge-entries.js` | Interactive entry consolidation |

See [toolkit/README.md](toolkit/README.md) for detailed documentation.

## 📖 Documentation

- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - How to propose new entries
- [TRANSFORMATION_GUIDE.md](docs/TRANSFORMATION_GUIDE.md) - HUMMBL transformation mapping guidelines
- [QUALITY_STANDARDS.md](docs/QUALITY_STANDARDS.md) - Citation and metadata standards
- [GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md) - Current coverage gaps and priorities
- [REPO_HEALTH.md](docs/REPO_HEALTH.md) - Owner, lifecycle, validation, and branch-protection contract
- [SCIENTIFIC_GROUNDING.md](SCIENTIFIC_GROUNDING.md) - Downstream grounding contract and export rules

## 🤝 Contributing

We welcome contributions! To add a new bibliography entry:

1. Check [docs/GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md) for priority areas
2. Use the [new-entry issue template](.github/ISSUE_TEMPLATE/new-entry.md)
3. Follow [QUALITY_STANDARDS.md](docs/QUALITY_STANDARDS.md) for formatting
4. Map to appropriate HUMMBL transformations
5. Submit a pull request

All submissions are automatically validated via pre-commit hooks and CI/CD.

## 🔍 Gap Analysis

Current priorities for quality improvement:

- **Perspective (P)**: 120 tags -- near the current average of 116.2
- **Inversion (IN)**: 101 tags -- below the current average of 116.2
- **Decomposition (DE)**: 108 tags -- slightly below the current average of 116.2
- **DOI coverage**: 70.8% overall
- **ISBN coverage**: 27.7% overall; strongest in book-heavy tiers

See [docs/GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md) for detailed analysis.

## 🤖 Automation

### Pre-commit Hooks

Automatically runs validation on modified `.bib` files:

```bash
cd toolkit
npm run setup
```

### GitHub Actions

- **Validation**: Runs on every PR
- **Stats Report**: Generated weekly
- **DOI Enrichment**: Manual trigger for batch updates
- **Grounding Export Check**: Ensures `dist/scientific-grounding-map.json` stays in sync with source inputs

## 🔬 Scientific Grounding

This repo is the HUMMBL Scientific Grounding citation layer.

- `bibliography/**/*.bib` is the canonical source record surface.
- `dist/unified-bibliography.json` is the normalized citation export.
- `dist/scientific-grounding-map.json` is the machine-readable downstream
  interface for evidence-tier routing, mapping references, and metadata debt.
- `docs/SCIENTIFIC_GROUNDING_RECEIPT.md` records the current map counts,
  critical/high metadata debt, downstream citation rules, and validation
  receipt.

Downstream repos should cite bibliography keys and import the grounding map
instead of copying full citation records.

## 📝 Citation Format

To cite this bibliography:

```bibtex
@misc{hummbl-bibliography,
  title = {HUMMBL Bibliography: Curated Works on Cognitive Transformations},
  author = {{HUMMBL Team}},
  year = {2025},
  howpublished = {\url{https://github.com/hummbl-dev/hummbl-bibliography}},
  note = {Version 1.0}
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to the researchers, authors, and practitioners whose work forms the foundation of the HUMMBL cognitive framework.

## 🔗 HUMMBL Ecosystem

Part of the [HUMMBL](https://github.com/hummbl-dev) cognitive AI architecture:

- [base120](https://github.com/hummbl-dev/base120) -- 120 mental models for structured reasoning
- [hummbl-governance](https://github.com/hummbl-dev/hummbl-governance) -- Governance primitives for AI agent orchestration
- [arbiter](https://github.com/hummbl-dev/arbiter) -- Agent-aware code quality scoring and attribution
- [hummbl-agent](https://github.com/hummbl-dev/hummbl-agent) -- Governed control plane for AI agent systems

---

**Maintained by**: HUMMBL Team  
**Last Updated**: 2026-04-08  
**Version**: 1.3.0

## Repository Health

See [docs/REPO_HEALTH.md](docs/REPO_HEALTH.md) for validation and branch-protection expectations.
