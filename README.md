# HUMMBL Bibliography

![Total Entries](https://img.shields.io/badge/entries-260-blue)
![DOI Coverage](https://img.shields.io/badge/DOIs-65%25-yellow)
![ISBN Coverage](https://img.shields.io/badge/ISBNs-30%25-green)
![Abstract Coverage](https://img.shields.io/badge/abstracts-100%25-brightgreen)
![Validation](https://github.com/hummbl-dev/hummbl-bibliography/workflows/validate/badge.svg)

A production-ready bibliography management system for the **HUMMBL (Base120) cognitive framework**. This repository maintains 260 curated academic and practitioner works organized into 13 thematic tiers, mapped to 6 cognitive transformations.

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

### Twelve Thematic Tiers (20 entries each)

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

All 260 entries have abstracts (150-300 words) and HUMMBL transformation tags.

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

Based on latest analysis (April 2026):

- **Total Entries**: 260 unique works across 13 tiers
- **Transformation Coverage** (tag count across all entries):
  - SY (Synthesis): 152
  - CO (Composition): 115
  - DE (Decomposition): 103
  - RE (Recursion): 97
  - IN (Inversion): 90
  - P (Perspective): 80
- **Quality Metrics**:
  - 100% have abstracts (150-300 word scholarly annotations)
  - 100% have HUMMBL transformation mappings
  - 65% have DOIs (169/260)
  - 30% have ISBNs (78/260)
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

- **Perspective (P)**: 80 tags (11.8%) -- underrepresented vs. 16.7% ideal
- **Inversion (IN)**: 90 tags (13.8%) -- slightly below target
- **DOI coverage**: 65% overall; T3 (applied/trade books) at 0%
- **ISBN coverage**: Strong in T1/T3 but low in T4-T12

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

---

**Maintained by**: HUMMBL Team  
**Last Updated**: 2026-04-08  
**Version**: 2.0.0
