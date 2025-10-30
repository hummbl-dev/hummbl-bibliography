# HUMMBL Bibliography Toolkit

A comprehensive Node.js toolkit for managing, validating, and analyzing the HUMMBL Bibliography.

## 🛠️ Tools Overview

| Tool | Purpose | Usage |
|------|---------|-------|
| `validate.js` | Validate BibTeX entries | `npm run validate` |
| `check-duplicates.js` | Find duplicate entries | `npm run check-dups` |
| `fix-duplicates.js` | Remove duplicates | `npm run fix-dups` |
| `find-missing-dois.js` | Enrich with DOIs | `npm run find-dois` |
| `stats.js` | Generate statistics | `npm run stats` |
| `extract-keywords.js` | Extract HUMMBL keywords | `npm run keywords` |
| `merge-entries.js` | Interactive merger | `npm run merge` |

## 📦 Installation

```bash
cd toolkit
npm install
```

## 🚀 Usage

### Validation

Validate all bibliography files for errors and warnings:

```bash
npm run validate
```

Output includes:
- Missing required fields
- Malformed DOIs/ISBNs
- Short abstracts
- Missing HUMMBL keywords

**CI Mode** (for automation):
```bash
npm run validate:ci
```
Returns JSON output and exits with error code if validation fails.

### Duplicate Detection

Check for duplicate entries across all files:

```bash
npm run check-dups
```

Detects duplicates by:
- Citation keys
- Normalized titles
- DOIs
- ISBNs

### Duplicate Removal

Automatically remove duplicates (keeps higher tier):

```bash
npm run fix-dups
```

Creates `.backup` files before modification.

**Dry run** (preview changes):
```bash
npm run fix-dups -- --dry-run
```

### DOI Enrichment

Find missing DOIs via CrossRef API:

```bash
npm run find-dois
```

⚠️ **Note**: Rate-limited to 1 request/second. May take several minutes.

Results include confidence scores for manual review.

### Statistics Generation

Generate comprehensive statistics:

```bash
npm run stats
```

Shows:
- Entry counts by tier and type
- Transformation distribution
- Quality metrics
- Gap analysis

**JSON output** (for automation):
```bash
npm run stats:json
```

### Keyword Extraction

Extract and display HUMMBL transformation keywords:

```bash
npm run keywords
```

Shows:
- Entries per transformation
- Cross-transformation analysis
- Coverage distribution

### Entry Merging

Interactive tool for consolidating entries:

```bash
npm run merge
```

Provides guidance for manual merging process.

## 🔧 Advanced Usage

### Validate Specific File

```bash
node src/validate.js ../bibliography/T1_canonical.bib
```

### Custom Statistics

```bash
node src/stats.js ../bibliography --json | jq '.transformations'
```

### Chain Commands

```bash
npm run validate && npm run check-dups && npm run stats
```

Or use the test suite:
```bash
npm test
```

## 📊 Output Formats

### Validation Output

```
============================================================
  HUMMBL Bibliography Validator
============================================================

📖 Validating T1_canonical.bib...
  Found 17 entries
  ✓ All entries valid

============================================================
  Validation Summary
============================================================

Total Entries: 48
Errors: 0
Warnings: 0

✨ All validations passed!
```

### Statistics Output

```
============================================================
  HUMMBL BIBLIOGRAPHY STATISTICS
============================================================

📊 OVERVIEW
Total Entries: 48

📚 BY TIER
  T1: 17 (35.4%) ████████
  T2: 16 (33.3%) ████████
  T3: 15 (31.3%) ███████

🔄 HUMMBL TRANSFORMATIONS
  SY (Synthesis    ): 20 ██████████
  CO (Composition  ): 18 █████████
  ...
```

### JSON Output

```json
{
  "total": 48,
  "byTier": {
    "T1": 17,
    "T2": 16,
    "T3": 15
  },
  "transformations": {
    "P": 17,
    "IN": 15,
    "CO": 18,
    "DE": 12,
    "RE": 16,
    "SY": 20
  },
  "quality": {
    "withDOI": 14,
    "withISBN": 35,
    "withAbstract": 48,
    "withKeywords": 48
  }
}
```

## 🤖 Automation

### Pre-commit Hooks

Setup Git hooks to validate on commit:

```bash
npm run setup
```

This installs Husky hooks that:
- Validate modified `.bib` files
- Check for duplicates
- Block commits with critical errors

### CI/CD Integration

The toolkit is designed for CI/CD integration:

**GitHub Actions Example**:
```yaml
- name: Validate bibliography
  run: |
    cd toolkit
    npm ci
    npm run validate:ci
```

See `.github/workflows/` for complete examples.

## 📝 Configuration

### package.json

All scripts are configured in `package.json`:

```json
{
  "scripts": {
    "validate": "node src/validate.js ../bibliography",
    "validate:ci": "node src/validate.js ../bibliography --ci",
    "check-dups": "node src/check-duplicates.js ../bibliography",
    "stats": "node src/stats.js ../bibliography",
    "stats:json": "node src/stats.js ../bibliography --json",
    ...
  }
}
```

### Directory Structure

```
toolkit/
├── src/
│   ├── validate.js           # Validation engine
│   ├── check-duplicates.js   # Duplicate detector
│   ├── fix-duplicates.js     # Duplicate remover
│   ├── find-missing-dois.js  # DOI enrichment
│   ├── stats.js              # Statistics generator
│   ├── extract-keywords.js   # Keyword extractor
│   └── merge-entries.js      # Entry merger
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependencies
└── README.md                 # This file
```

## 🧪 Testing

Run the full test suite:

```bash
npm test
```

This runs:
1. Validation on all files
2. Duplicate detection

## 🐛 Troubleshooting

### "Citation-js not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Permission denied" on scripts

```bash
chmod +x src/*.js
```

### Validation fails on valid entries

Check that:
- BibTeX syntax is correct
- All required fields are present
- Field names use correct casing

### DOI finder times out

The CrossRef API is rate-limited. The script waits 1 second between requests. For large batches, this may take time.

## 📚 Dependencies

- **@citation-js/core**: BibTeX parsing
- **@citation-js/plugin-bibtex**: BibTeX format support
- **axios**: HTTP requests for DOI enrichment
- **chalk**: Terminal colors and formatting
- **commander**: CLI argument parsing (future)

## 🔮 Future Enhancements

- [ ] Watch mode for continuous validation
- [ ] Interactive TUI for managing entries
- [ ] Export to multiple formats (APA, Chicago, etc.)
- [ ] Automated relevance scoring
- [ ] Network graph generation
- [ ] Web dashboard

## 📖 Documentation

- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) - Contribution guidelines
- [QUALITY_STANDARDS.md](../docs/QUALITY_STANDARDS.md) - Entry standards
- [TRANSFORMATION_GUIDE.md](../docs/TRANSFORMATION_GUIDE.md) - HUMMBL mapping

## 📄 License

MIT License - see [../LICENSE](../LICENSE)

---

**Maintained by**: HUMMBL Team  
**Version**: 1.0.0
