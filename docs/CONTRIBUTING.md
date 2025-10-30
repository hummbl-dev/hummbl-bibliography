# Contributing to HUMMBL Bibliography

Thank you for your interest in contributing to the HUMMBL Bibliography! This document provides guidelines for proposing new entries and improving the bibliography.

## 🎯 Contribution Goals

We aim to:
- Maintain high-quality, authoritative sources
- Ensure balanced coverage across all six HUMMBL transformations
- Provide comprehensive metadata for each entry
- Foster a collaborative and inclusive community

## 📝 How to Propose New Entries

### 1. Check Current Coverage

Before proposing a new entry:
- Review [GAP_ANALYSIS.md](GAP_ANALYSIS.md) for priority areas
- Check existing entries to avoid duplicates
- Run `npm run keywords` to see current transformation distribution

### 2. Create an Issue

Use the [new-entry issue template](../.github/ISSUE_TEMPLATE/new-entry.md):

```markdown
### Entry Type
- [x] Book

### Basic Information
- **Title:** The Fifth Discipline
- **Author(s):** Peter M. Senge
- **Year:** 1990
- **DOI/ISBN:** 978-0385517256

### HUMMBL Mapping
- **Primary Transformation:** SY (Synthesis)
- **Secondary Transformation(s):** RE (Recursion)
- **Rationale:** Introduces systems thinking and learning organizations

### Quality Tier
- [x] T1 - Canonical

### BibTeX Entry
@book{Senge1990FifthDiscipline,
  title = {The Fifth Discipline: The Art and Practice of the Learning Organization},
  author = {Senge, Peter M.},
  year = {1990},
  publisher = {Doubleday},
  isbn = {978-0385517256},
  abstract = {...},
  keywords = {systems thinking, organizational learning, HUMMBL:SY, HUMMBL:RE}
}
```

### 3. Quality Requirements

All entries must meet these standards (see [QUALITY_STANDARDS.md](QUALITY_STANDARDS.md)):

#### Required Fields
- **title**: Full, accurate title
- **author**: All authors in proper BibTeX format
- **year**: Publication year
- **publisher** (for books) or **journal** (for articles)
- **abstract**: At least 50 characters
- **keywords**: Including at least one `HUMMBL:XX` tag

#### Recommended Fields
- **DOI**: For articles and conference papers
- **ISBN**: For books (13-digit format with hyphens: 978-X-XXX-XXXXX-X)
- **volume/number/pages**: For journal articles

### 4. HUMMBL Transformation Mapping

Map your entry to appropriate transformations (see [TRANSFORMATION_GUIDE.md](TRANSFORMATION_GUIDE.md)):

- **P (Perspective)**: Changes how we observe or frame problems
- **IN (Inversion)**: Explores opposite approaches or negative cases
- **CO (Composition)**: Shows how to build up or combine elements
- **DE (Decomposition)**: Demonstrates breaking down into parts
- **RE (Recursion)**: Involves self-reference or iterative processes
- **SY (Synthesis)**: Integrates multiple elements into coherent wholes

**Guidelines:**
- Assign 1-3 transformations per entry
- Primary transformation should be most prominent
- Provide rationale in your issue

### 5. Tier Assignment

Choose the appropriate quality tier:

**T1 (Canonical)**
- Foundational theoretical works
- Seminal texts that defined fields
- Widely cited across disciplines
- 10+ years since publication (typically)

**T2 (Empirical)**
- Peer-reviewed research papers
- Rigorous experimental methods
- Published in reputable journals
- Significant citations in literature

**T3 (Applied)**
- Practitioner-focused books
- Industry applications
- Case studies and frameworks
- Accessible to non-academics

## 🔧 Submission Process

### Option 1: Pull Request (Preferred)

1. Fork the repository
2. Create a feature branch: `git checkout -b add-entry-yourname`
3. Add your entry to the appropriate `.bib` file
4. Run validation: `cd toolkit && npm run validate`
5. Commit with descriptive message: `git commit -m "feat: add [AuthorYear] to T1"`
6. Push and create pull request

### Option 2: Issue Only

If you're not comfortable with Git:
1. Create a new issue using the template
2. Provide complete BibTeX entry
3. Community members will add it for you

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Entry added to correct tier file (T1/T2/T3)
- [ ] All required fields present
- [ ] Abstract is ≥50 characters
- [ ] HUMMBL keywords included (e.g., `HUMMBL:SY, HUMMBL:RE`)
- [ ] DOI/ISBN properly formatted
- [ ] Validation passes: `npm run validate`
- [ ] No duplicates: `npm run check-dups`
- [ ] BibTeX syntax is correct
- [ ] Citation key follows format: `AuthorYearShortTitle`

## 🔍 Review Process

1. **Automated Checks**: CI validates syntax and checks for duplicates
2. **Peer Review**: Community members review mapping and quality
3. **Maintainer Approval**: Core team verifies tier assignment
4. **Merge**: Entry added to main bibliography

Typical review time: 3-7 days

## 🎨 Style Guidelines

### Citation Keys

Format: `AuthorYearShortTitle`

Examples:
- `Meadows2008ThinkingSystems`
- `Kahneman2011Thinking`
- `Tversky1974Judgment`

### Author Names

Use BibTeX format:

```bibtex
author = {LastName, FirstName}                    % Single author
author = {Last1, First1 and Last2, First2}        % Multiple authors
author = {{Organization Name}}                     % Corporate author
```

### Abstracts

- Minimum 50 characters
- Maximum 500 words
- Use author's original abstract when available
- If creating summary, be objective and comprehensive

### Keywords

Format: `keyword1, keyword2, HUMMBL:XX, HUMMBL:YY`

- List descriptive keywords first
- End with HUMMBL transformation tags
- Use lowercase except for HUMMBL tags

## 🚫 What NOT to Contribute

Please avoid:

- **Self-promotion**: No entries by contributors (conflict of interest)
- **Non-academic blogs**: Unless exceptionally influential
- **Duplicates**: Check existing entries first
- **Low-quality sources**: Self-published, non-peer-reviewed for T2
- **Incomplete entries**: Must have all required fields
- **Unrelated works**: Must connect to cognitive transformations

## 🐛 Reporting Issues

Found a problem with an existing entry?

1. Check if issue already reported
2. Create issue with:
   - Entry citation key
   - Problem description
   - Suggested fix (if applicable)
   - Evidence/rationale

## 💬 Questions?

- Open a discussion in GitHub Discussions
- Tag issues with `question` label
- Contact maintainers: [your-contact@example.com]

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment:

- Be respectful and professional
- Assume good intentions
- Provide constructive feedback
- Focus on the work, not the person
- Credit others' contributions

Violations will result in warnings or bans from the project.

## 🏆 Recognition

Contributors are acknowledged in:
- Commit history
- Annual contributor list (to be published)
- Special mentions for significant contributions

Thank you for helping build the HUMMBL Bibliography!

---

**Questions?** Open an issue with the `question` label.
**Need help?** See [QUALITY_STANDARDS.md](QUALITY_STANDARDS.md) and [TRANSFORMATION_GUIDE.md](TRANSFORMATION_GUIDE.md).
