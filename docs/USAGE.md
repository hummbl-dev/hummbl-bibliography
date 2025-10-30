# HUMMBL Bibliography Usage Guide

This guide explains how to use the HUMMBL Bibliography manager and its validation toolkit.

## Table of Contents

1. [Installation](#installation)
2. [Bibliography Structure](#bibliography-structure)
3. [Validation Scripts](#validation-scripts)
4. [NPM Scripts](#npm-scripts)
5. [CI/CD Integration](#cicd-integration)
6. [Export Formats](#export-formats)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/hummbl-dev/hummbl-bibliography.git
cd hummbl-bibliography
npm install
```

## Bibliography Structure

The bibliography is organized into three tiers:

### Tier 1: Core References (`tier1-core.bib`)

Foundational works that define the core concepts of the HUMMBL cognitive framework. These are essential references for understanding the fundamental principles.

**Characteristics:**
- Seminal works in cognitive science and AI
- Foundational theories and frameworks
- Classic textbooks and reference materials

### Tier 2: Applied References (`tier2-applied.bib`)

Practical applications and implementations of cognitive frameworks. These references demonstrate how theoretical concepts are applied in real-world scenarios.

**Characteristics:**
- Implementation case studies
- Applied methodologies
- Practical guidelines and best practices

### Tier 3: Emerging References (`tier3-emerging.bib`)

Recent developments and cutting-edge research. These references cover the latest advancements and future directions in the field.

**Characteristics:**
- Recent publications (last 5 years)
- Emerging technologies and techniques
- Future research directions

## Validation Scripts

The toolkit includes seven validation scripts:

### 1. BibTeX Validator (`validate-bibtex.js`)

Validates BibTeX syntax and structure:

```bash
node toolkit/validate-bibtex.js
# or
npm run validate:bibtex
```

**Checks:**
- File existence and readability
- Balanced braces
- Required fields (author, title, year)
- Entry structure

### 2. Duplicate Checker (`check-duplicates.js`)

Identifies duplicate citation keys:

```bash
node toolkit/check-duplicates.js
# or
npm run validate:duplicates
```

**Checks:**
- Unique citation keys across all files
- Reports conflicting keys and their locations

### 3. Keyword Validator (`validate-keywords.js`)

Validates keyword usage and consistency:

```bash
node toolkit/validate-keywords.js
# or
npm run validate:keywords
```

**Checks:**
- Entries with/without keywords
- Keyword distribution by tier
- Unique keyword inventory

### 4. Tier Structure Validator (`check-tiers.js`)

Verifies the three-tier structure:

```bash
node toolkit/check-tiers.js
# or
npm run validate:tiers
```

**Checks:**
- All three tier files exist
- Entry counts per tier
- Unexpected files in bibliography directory

### 5. Statistics Generator (`generate-stats.js`)

Generates comprehensive statistics:

```bash
node toolkit/generate-stats.js
# or
npm run stats
```

**Provides:**
- Per-tier statistics
- Aggregate metrics
- Entry type distribution
- Year range analysis
- Top keywords

### 6. Format Exporter (`export-formats.js`)

Exports bibliography to multiple formats:

```bash
node toolkit/export-formats.js
# or
npm run export
```

**Outputs:**
- `docs/bibliography.json` - JSON format
- `docs/BIBLIOGRAPHY.md` - Markdown format

### 7. Comprehensive Validator (`validate-all.js`)

Runs all validation scripts:

```bash
node toolkit/validate-all.js
# or
npm run validate
# or
npm test
```

## NPM Scripts

Available npm scripts:

| Script | Description |
|--------|-------------|
| `npm run validate` | Run all validations |
| `npm run validate:bibtex` | Validate BibTeX syntax |
| `npm run validate:duplicates` | Check for duplicates |
| `npm run validate:keywords` | Validate keywords |
| `npm run validate:tiers` | Check tier structure |
| `npm run stats` | Generate statistics |
| `npm run export` | Export to multiple formats |
| `npm test` | Run validation (alias for `npm run validate`) |

## CI/CD Integration

The repository includes GitHub Actions CI workflow (`.github/workflows/ci.yml`) that:

1. Runs on push and pull requests to main/develop branches
2. Tests against Node.js 18.x and 20.x
3. Executes all validation scripts
4. Generates and uploads exported formats as artifacts
5. Verifies directory structure and file permissions

### Viewing CI Results

- Check the "Actions" tab in the GitHub repository
- View detailed logs for each validation step
- Download exported files from artifacts

## Export Formats

### JSON Format

The JSON export provides structured data:

```json
[
  {
    "type": "article",
    "key": "author2023example",
    "fields": {
      "title": "Example Title",
      "author": "Author Name",
      "year": "2023",
      "keywords": "keyword1, keyword2"
    },
    "source": "tier1-core.bib",
    "tier": "tier1-core"
  }
]
```

### Markdown Format

The Markdown export provides human-readable documentation organized by tier, with formatted entries including all bibliographic information.

## Pre-commit Hooks

Husky pre-commit hooks automatically validate changes before commits:

```bash
git commit -m "Add new reference"
# Automatically runs: npm run validate
```

If validation fails, the commit is blocked. Fix issues and try again.

## Tips and Best Practices

1. **Always validate before committing:**
   ```bash
   npm run validate
   ```

2. **Check statistics regularly:**
   ```bash
   npm run stats
   ```

3. **Export formats for sharing:**
   ```bash
   npm run export
   ```

4. **Use consistent citation keys:**
   - Follow the pattern: `author[year][keyword]`

5. **Add meaningful keywords:**
   - Help with categorization and searching
   - Use consistent terminology

6. **Keep tiers balanced:**
   - Each tier should serve its specific purpose
   - Avoid mixing tier categories

## Troubleshooting

### Validation Errors

If you encounter validation errors:

1. Read the error messages carefully
2. Check the specific file mentioned
3. Verify BibTeX syntax
4. Ensure all required fields are present
5. Check for duplicate citation keys

### Pre-commit Hook Issues

If the pre-commit hook fails:

```bash
# Skip the hook temporarily (not recommended)
git commit --no-verify -m "message"

# Or fix the issues and commit normally
npm run validate
# Fix any errors
git commit -m "message"
```

## Getting Help

- Check the [CONTRIBUTING.md](CONTRIBUTING.md) guide
- Open an issue on GitHub
- Review existing documentation
