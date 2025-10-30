# HUMMBL Bibliography - Architecture & Design

This document describes the architectural decisions and design principles behind the HUMMBL Bibliography Manager.

## Overview

The HUMMBL Bibliography Manager is a production-ready system for managing research references in the cognitive science and artificial intelligence domain. It emphasizes:

1. **Structure**: Three-tier organization by reference maturity
2. **Quality**: Automated validation and quality checks
3. **Automation**: CI/CD integration and pre-commit hooks
4. **Extensibility**: Modular toolkit architecture
5. **Interoperability**: Multiple export formats

## Directory Structure

```
hummbl-bibliography/
├── bibliography/          # Bibliography data (source of truth)
├── toolkit/              # Validation and utility scripts
├── docs/                 # Documentation and exports
├── .github/workflows/    # CI/CD configuration
└── .husky/              # Git hooks
```

## Three-Tier Bibliography System

### Design Rationale

The three-tier system organizes references by their relationship to the HUMMBL framework:

**Tier 1: Core (Foundational)**
- Timeless, fundamental works
- Establishes theoretical foundation
- Essential for understanding core concepts
- Example: Classic textbooks, seminal papers

**Tier 2: Applied (Practical)**
- Implementation-focused references
- Bridges theory and practice
- Demonstrates real-world applications
- Example: Case studies, methodology papers

**Tier 3: Emerging (Cutting-edge)**
- Recent developments (typically < 5 years)
- Future research directions
- Emerging technologies
- Example: Latest conference papers, new techniques

### Benefits

1. **Clear organization**: Immediate understanding of reference relevance
2. **Evolutionary tracking**: Shows field progression over time
3. **Maintenance**: Easy to identify outdated vs. timeless references
4. **Onboarding**: Newcomers can start with Tier 1 and progress

## Validation Toolkit

### Architecture

The toolkit consists of seven independent, composable scripts:

```
validate-bibtex.js      → BibTeX syntax validation
check-duplicates.js     → Duplicate key detection
validate-keywords.js    → Keyword consistency
check-tiers.js         → Structure validation
generate-stats.js      → Statistical analysis
export-formats.js      → Format conversion
validate-all.js        → Orchestration layer
```

### Design Principles

1. **Single Responsibility**: Each script has one clear purpose
2. **Composability**: Can be run independently or together
3. **Zero Dependencies**: Pure Node.js, no external packages needed
4. **Exit Codes**: Proper exit codes for CI/CD integration
5. **Readable Output**: Human-friendly console output

### Script Details

#### 1. validate-bibtex.js
- **Purpose**: Ensures BibTeX syntax correctness
- **Checks**: Balanced braces, required fields, entry structure
- **Exit Code**: 0 if valid, 1 if errors found

#### 2. check-duplicates.js
- **Purpose**: Prevents duplicate citation keys
- **Algorithm**: Builds key map across all files
- **Reports**: Key name and files where duplicates appear

#### 3. validate-keywords.js
- **Purpose**: Ensures keyword consistency
- **Reports**: Keyword distribution, missing keywords
- **Non-blocking**: Warnings only, allows flexibility

#### 4. check-tiers.js
- **Purpose**: Verifies three-tier structure integrity
- **Checks**: All tier files exist, no unexpected files
- **Counts**: Entry statistics per tier

#### 5. generate-stats.js
- **Purpose**: Provides comprehensive analytics
- **Metrics**: Entry counts, types, years, authors, keywords
- **Output**: Formatted report with visual elements

#### 6. export-formats.js
- **Purpose**: Converts bibliography to multiple formats
- **Outputs**: JSON (machine-readable), Markdown (human-readable)
- **Location**: docs/ directory for easy access

#### 7. validate-all.js
- **Purpose**: Orchestrates all validators
- **Execution**: Sequential running with result aggregation
- **Summary**: Pass/fail report for each validator

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline (.github/workflows/ci.yml) includes two jobs:

**Job 1: validate**
- Matrix testing (Node.js 18.x, 20.x)
- Runs all validation scripts
- Exports bibliography to multiple formats
- Uploads artifacts for download

**Job 2: lint-quality**
- Verifies file permissions
- Checks directory structure
- Ensures required files exist

### Benefits

1. **Early Detection**: Catches errors before merge
2. **Multi-version**: Tests against multiple Node.js versions
3. **Artifacts**: Generated exports available for download
4. **Documentation**: Self-documenting through workflow steps

## Pre-commit Hooks (Husky)

### Configuration

- **Hook**: pre-commit
- **Action**: Runs `npm run validate`
- **Behavior**: Blocks commit if validation fails

### Workflow

```
Developer commits → Husky intercepts → Runs validators → 
  ✓ Pass: Commit proceeds
  ✗ Fail: Commit blocked, errors shown
```

### Benefits

1. **Prevention**: Stops invalid data at source
2. **Fast Feedback**: Immediate error notification
3. **Consistency**: Ensures all commits meet quality standards
4. **Developer Experience**: Clear error messages

## NPM Scripts

### Script Hierarchy

```
npm test
  └─→ npm run validate
       └─→ validate-all.js
            ├─→ check-tiers.js
            ├─→ validate-bibtex.js
            ├─→ check-duplicates.js
            ├─→ validate-keywords.js
            └─→ generate-stats.js
```

### Design Decisions

1. **Intuitive Names**: Clear purpose from script name
2. **Namespacing**: `validate:*` for validation scripts
3. **Aliasing**: `test` → `validate` for standard workflow
4. **Composition**: Higher-level scripts call lower-level

## Data Format (BibTeX)

### Why BibTeX?

1. **Standard**: Widely adopted in academia
2. **Tool Support**: Compatible with LaTeX, reference managers
3. **Plain Text**: Git-friendly, easy to diff
4. **Extensible**: Custom fields supported

### Field Requirements

**Required Fields (enforced):**
- `author` (or `editor` for edited volumes)
- `title`
- `year`

**Recommended Fields:**
- `keywords` (for categorization)
- `publisher` or `journal` (for source)
- `doi` or `url` (for access)

## Export Formats

### JSON Format

**Purpose**: Machine-readable for integrations

**Structure**:
```json
{
  "type": "article",
  "key": "citation_key",
  "fields": { ... },
  "source": "tier1-core.bib",
  "tier": "tier1-core"
}
```

**Use Cases**:
- Web applications
- Data analysis
- API integrations

### Markdown Format

**Purpose**: Human-readable documentation

**Features**:
- Organized by tier
- Formatted entries
- Complete bibliographic information

**Use Cases**:
- Documentation websites
- PDF generation
- Quick reference

## Scalability Considerations

### Current Scale
- 3 tiers
- ~12 sample entries
- 7 validation scripts

### Growth Strategy

**Adding Entries**:
1. Add to appropriate tier file
2. Run `npm run validate` before commit
3. Pre-commit hook ensures quality

**Adding Validators**:
1. Create new script in toolkit/
2. Follow existing patterns
3. Update validate-all.js to include
4. Add npm script

**Adding Tiers** (if needed):
1. Create new .bib file with tier naming
2. Update check-tiers.js with new tier
3. Update documentation

### Performance

Current implementation handles:
- Hundreds of entries efficiently
- Sub-second validation times
- Reasonable for typical academic use

For very large bibliographies (1000+ entries):
- Consider database backend
- Add caching mechanisms
- Parallelize validations

## Security Considerations

1. **No External Dependencies**: Validation toolkit has zero dependencies
2. **Input Validation**: All file reads have error handling
3. **Path Safety**: Uses path.join() for safe path construction
4. **No Eval**: No dynamic code execution

## Extensibility Points

### Adding New Validators

```javascript
// toolkit/new-validator.js
#!/usr/bin/env node
function main() {
  // Your validation logic
  process.exit(allValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { /* exports */ };
```

### Adding New Export Formats

Extend `export-formats.js`:
```javascript
function exportToNewFormat(entries, outputPath) {
  // Your export logic
}
```

### Custom Validation Rules

Extend existing validators or create new ones:
- Field-specific validation
- Citation style checking
- External API integration (DOI validation, etc.)

## Best Practices

### For Contributors

1. **Test Locally**: Run `npm run validate` before pushing
2. **Meaningful Keys**: Use descriptive citation keys
3. **Complete Entries**: Include all recommended fields
4. **Keywords**: Add relevant, consistent keywords

### For Maintainers

1. **Keep Validators Simple**: One responsibility per script
2. **Document Changes**: Update relevant docs
3. **Backward Compatibility**: Don't break existing scripts
4. **Version Carefully**: Follow semantic versioning

## Future Enhancements

### Planned Features

1. **Enhanced Validation**:
   - DOI validation via external API
   - Author name consistency checking
   - Journal name standardization

2. **Additional Exports**:
   - CSV format
   - RIS format
   - BibLaTeX format

3. **Search & Filter**:
   - CLI search tool
   - Filter by keyword/year/author
   - Tag-based organization

4. **Integration**:
   - Zotero integration
   - Mendeley sync
   - Web interface

### Architecture Evolution

As the system grows, consider:
- Microservices for validation
- Database backend for large datasets
- API layer for programmatic access
- Web UI for non-technical users

## Conclusion

The HUMMBL Bibliography Manager prioritizes:
- **Quality**: Through comprehensive validation
- **Maintainability**: Through clear structure and documentation
- **Automation**: Through CI/CD and git hooks
- **Extensibility**: Through modular design

This architecture supports the current needs while allowing for future growth and enhancement.
