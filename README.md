# HUMMBL Bibliography

![Total Entries](https://img.shields.io/badge/entries-48-blue)
![DOI Coverage](https://img.shields.io/badge/DOIs-29%25-yellow)
![ISBN Coverage](https://img.shields.io/badge/ISBNs-73%25-green)
![Abstract Coverage](https://img.shields.io/badge/abstracts-100%25-brightgreen)
![Validation](https://github.com/hummbl-dev/hummbl-bibliography/workflows/validate/badge.svg)

A production-ready bibliography management system for the **HUMMBL (Base120) cognitive framework**. This repository maintains 48+ curated academic and practitioner works organized into 3 quality tiers, mapped to 6 cognitive transformations.

## 🎯 Overview

The HUMMBL cognitive framework identifies six fundamental thinking operations:

- **P** (Perspective): Observation, framing, lens-shifting
- **IN** (Inversion): Reversal, negation, contrapositive thinking
- **CO** (Composition): Building up, combining elements
- **DE** (Decomposition): Breaking down, analysis into parts
- **RE** (Recursion): Self-reference, iterative processes, feedback loops
- **SY** (Synthesis): Integration, holistic thinking, emergent properties

This bibliography provides the theoretical foundation and empirical evidence for these transformations through carefully selected works spanning systems thinking, cognitive psychology, design, and organizational learning.

## 📚 Bibliography Structure

### Three Quality Tiers

**T1: Canonical** (17 entries)

- Foundational theoretical works
- Seminal texts that define fields
- Examples: Meadows' *Thinking in Systems*, Kahneman's *Thinking, Fast and Slow*

**T2: Empirical** (16 entries)

- Peer-reviewed research papers
- Rigorous experimental findings
- **Abstract Coverage: 100%** (all entries enhanced with 150-200 word summaries)
- Examples: Tversky & Kahneman on heuristics, Simon on bounded rationality

**T3: Applied** (15 entries)

- Practitioner-focused texts
- Industry applications
- Examples: Ries' *Lean Startup*, Brown's *Change by Design*

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

Based on latest analysis:

- **Total Entries**: 48 unique works
- **Transformation Coverage**:
  - SY (Synthesis): 20 entries
  - CO (Composition): 18 entries
  - P (Perspective): 17 entries
  - RE (Recursion): 16 entries
  - IN (Inversion): 15 entries
  - DE (Decomposition): 12 entries
- **Quality Metrics**:
  - 100% have abstracts
  - 100% have HUMMBL transformation mappings
  - 73% have ISBNs
  - 29% have DOIs

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

Current priorities for bibliography expansion:

- **Decomposition (DE)**: Need 4-6 additional entries
  - Analytical frameworks
  - Problem decomposition methodologies
  - Chunking and modularization

- **Inversion (IN)**: Need 3-5 additional entries
  - Negative space and contrapositive thinking
  - Failure mode analysis
  - Paradoxical interventions

See [docs/GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md) for candidate works.

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
**Last Updated**: 2025-01-30  
**Version**: 1.0.0
