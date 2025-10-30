# HUMMBL Bibliography

[![CI](https://github.com/hummbl-dev/hummbl-bibliography/actions/workflows/ci.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-bibliography/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)

A production-ready bibliography manager for the HUMMBL cognitive framework with a three-tier structure and comprehensive validation toolkit.

## 📚 Overview

HUMMBL Bibliography provides a structured approach to managing research references for cognitive science and artificial intelligence. The repository includes:

- **Three-tier bibliography structure** organized by reference maturity and relevance
- **Seven validation scripts** ensuring data quality and consistency
- **Automated CI/CD pipeline** with GitHub Actions
- **Pre-commit hooks** preventing invalid commits
- **Multiple export formats** (JSON, Markdown) for easy integration

## 🏗️ Repository Structure

```
hummbl-bibliography/
├── bibliography/              # BibTeX files organized in three tiers
│   ├── tier1-core.bib        # Foundational works
│   ├── tier2-applied.bib     # Practical applications
│   └── tier3-emerging.bib    # Recent developments
├── toolkit/                   # Validation and utility scripts
│   ├── validate-bibtex.js    # BibTeX syntax validator
│   ├── check-duplicates.js   # Duplicate key checker
│   ├── validate-keywords.js  # Keyword validator
│   ├── check-tiers.js        # Tier structure validator
│   ├── generate-stats.js     # Statistics generator
│   ├── export-formats.js     # Format exporter
│   └── validate-all.js       # Comprehensive validator
├── docs/                      # Documentation
│   ├── USAGE.md              # Usage guide
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── bibliography.json     # Exported JSON (generated)
│   └── BIBLIOGRAPHY.md       # Exported Markdown (generated)
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── .husky/                    # Git hooks
│   └── pre-commit            # Pre-commit validation
├── package.json              # Node.js configuration
├── .gitignore               # Git ignore rules
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/hummbl-dev/hummbl-bibliography.git
cd hummbl-bibliography

# Install dependencies
npm install
```

### Basic Usage

```bash
# Run all validations
npm run validate

# Run specific validations
npm run validate:bibtex      # Check BibTeX syntax
npm run validate:duplicates  # Check for duplicate keys
npm run validate:keywords    # Validate keywords
npm run validate:tiers       # Check tier structure

# Generate statistics
npm run stats

# Export to multiple formats
npm run export
```

## 📊 Three-Tier Structure

### Tier 1: Core References (`tier1-core.bib`)
Foundational works that define core concepts of cognitive frameworks and artificial intelligence.

**Examples:**
- Unified theories of cognition
- Fundamental AI textbooks
- Seminal papers in cognitive architecture

### Tier 2: Applied References (`tier2-applied.bib`)
Practical applications and implementations of cognitive frameworks.

**Examples:**
- Cognitive architecture implementations (Soar, ACT-R)
- Applied methodologies
- Survey papers and reviews

### Tier 3: Emerging References (`tier3-emerging.bib`)
Recent developments, cutting-edge research, and future directions.

**Examples:**
- Deep learning advances
- Transformer architectures
- Recent breakthroughs (AlphaFold, GPT-3, etc.)

## 🛠️ Validation Toolkit

The repository includes seven Node.js validation scripts:

| Script | Purpose | Command |
|--------|---------|---------|
| `validate-bibtex.js` | Validates BibTeX syntax and structure | `npm run validate:bibtex` |
| `check-duplicates.js` | Checks for duplicate citation keys | `npm run validate:duplicates` |
| `validate-keywords.js` | Validates keyword usage | `npm run validate:keywords` |
| `check-tiers.js` | Verifies three-tier structure | `npm run validate:tiers` |
| `generate-stats.js` | Generates comprehensive statistics | `npm run stats` |
| `export-formats.js` | Exports to JSON and Markdown | `npm run export` |
| `validate-all.js` | Runs all validations | `npm run validate` |

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- ✅ Validates all BibTeX files
- ✅ Checks for duplicates and errors
- ✅ Verifies three-tier structure
- ✅ Tests on Node.js 18.x and 20.x
- ✅ Generates statistics
- ✅ Exports to multiple formats
- ✅ Uploads artifacts

## 🪝 Pre-commit Hooks

Husky automatically runs validations before each commit:

```bash
git commit -m "Add new reference"
# Automatically runs: npm run validate
# Commit proceeds only if validation passes
```

## 📤 Export Formats

### JSON Export
Structured data format for programmatic access:

```bash
npm run export
# Output: docs/bibliography.json
```

### Markdown Export
Human-readable documentation format:

```bash
npm run export
# Output: docs/BIBLIOGRAPHY.md
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Add your changes (ensure they pass validation)
4. Commit: `git commit -m "Description of changes"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

## 📖 Documentation

- [Usage Guide](docs/USAGE.md) - Detailed usage instructions
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute
- [Bibliography (Markdown)](docs/BIBLIOGRAPHY.md) - Exported bibliography (generated)

## 📋 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run validate` | Run all validations |
| `npm run validate:bibtex` | Validate BibTeX syntax |
| `npm run validate:duplicates` | Check for duplicate keys |
| `npm run validate:keywords` | Validate keywords |
| `npm run validate:tiers` | Check tier structure |
| `npm run stats` | Generate statistics report |
| `npm run export` | Export to JSON and Markdown |
| `npm test` | Run validation suite (alias) |

## 🔒 Quality Assurance

- ✅ Automated validation on every commit (pre-commit hooks)
- ✅ Comprehensive CI/CD testing
- ✅ Multi-version Node.js support (18.x, 20.x)
- ✅ Syntax and structure validation
- ✅ Duplicate detection
- ✅ Keyword consistency checking

## 📈 Statistics

Run `npm run stats` to see:
- Total entry counts
- Per-tier statistics
- Entry type distribution
- Year range analysis
- Keyword frequency
- Author statistics

## 🐛 Troubleshooting

### Validation Fails

```bash
# Check detailed error messages
npm run validate

# Run individual validators for specifics
npm run validate:bibtex
npm run validate:duplicates
```

### Pre-commit Hook Issues

```bash
# Ensure hooks are installed
npm run prepare

# Manually run validation
npm run validate
```

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

HUMMBL Dev Team

## 🙏 Acknowledgments

- Built for the HUMMBL cognitive framework project
- Inspired by best practices in bibliography management
- Community contributions welcome

---

**Production-ready** | **CI/CD Integrated** | **Quality Validated**
