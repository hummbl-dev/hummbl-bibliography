# Quality Standards for HUMMBL Bibliography

This document defines the quality standards for bibliography entries, including required fields, formatting conventions, and validation criteria.

## 📋 Required Fields by Entry Type

### Books (@book)

**Required**:
- `title`: Full title (with subtitle if applicable)
- `author`: Author(s) in proper BibTeX format
- `year`: Publication year
- `publisher`: Publishing house
- `isbn`: 13-digit ISBN with hyphens (e.g., 978-0-XXX-XXXXX-X)
- `abstract`: Minimum 50 characters
- `keywords`: Including at least one `HUMMBL:XX` tag

**Recommended**:
- `edition`: For non-first editions (e.g., "2nd", "Revised")
- `doi`: If available

**Example**:
```bibtex
@book{Meadows2008ThinkingSystems,
  title = {Thinking in Systems: A Primer},
  author = {Meadows, Donella H.},
  year = {2008},
  publisher = {Chelsea Green Publishing},
  isbn = {978-1603580557},
  abstract = {In the years following her role as the lead author...},
  keywords = {systems thinking, HUMMBL:SY, HUMMBL:RE, HUMMBL:CO}
}
```

### Journal Articles (@article)

**Required**:
- `title`: Article title
- `author`: Author(s)
- `year`: Publication year
- `journal`: Journal name
- `volume`: Volume number
- `number`: Issue number
- `pages`: Page range (e.g., 123--145)
- `abstract`: Minimum 50 characters
- `keywords`: Including at least one `HUMMBL:XX` tag

**Recommended**:
- `doi`: Strongly recommended for all articles

**Example**:
```bibtex
@article{Tversky1974Judgment,
  title = {Judgment under Uncertainty: Heuristics and Biases},
  author = {Tversky, Amos and Kahneman, Daniel},
  year = {1974},
  journal = {Science},
  volume = {185},
  number = {4157},
  pages = {1124--1131},
  doi = {10.1126/science.185.4157.1124},
  abstract = {This article described three heuristics...},
  keywords = {heuristics, cognitive bias, HUMMBL:IN, HUMMBL:DE}
}
```

### Conference Papers (@inproceedings or @incollection)

**Required**:
- `title`: Paper title
- `author`: Author(s)
- `year`: Publication year
- `booktitle`: Conference/book name
- `pages`: Page range
- `abstract`: Minimum 50 characters
- `keywords`: Including at least one `HUMMBL:XX` tag

**Recommended**:
- `publisher`: Publishing organization
- `doi`: If available
- `editor`: For collections

## 🎨 Formatting Standards

### Author Names

**Single Author**:
```bibtex
author = {LastName, FirstName MiddleInitial.}
```

**Multiple Authors**:
```bibtex
author = {Last1, First1 and Last2, First2 and Last3, First3}
```

**Corporate Authors**:
```bibtex
author = {{Organization Name}}
```

**With Jr., Sr., III**:
```bibtex
author = {King, Martin Luther, Jr.}
```

### Titles

- Use title case for book titles
- Use sentence case for article titles
- Include subtitles with colon separator
- Preserve special formatting with braces: `{API}`, `{DNA}`

**Examples**:
```bibtex
title = {Thinking in Systems: A Primer}  % Book
title = {Judgment under uncertainty: Heuristics and biases}  % Article
title = {The {DNA} of {Collaboration}}  % Preserved caps
```

### DOI Format

Always use full DOI format:
```bibtex
doi = {10.1126/science.185.4157.1124}
```

Not: `https://doi.org/...` or `DOI:...`

### ISBN Format

Use 13-digit ISBN with hyphens:
```bibtex
isbn = {978-1-234-56789-0}
```

### Page Ranges

Use double hyphens for ranges:
```bibtex
pages = {123--145}
```

Not: `123-145` or `123–145`

### Keywords

Format: `descriptive, keywords, HUMMBL:XX, HUMMBL:YY`

- List descriptive keywords first
- End with HUMMBL transformation tags
- Lowercase except HUMMBL tags
- Comma-separated

**Example**:
```bibtex
keywords = {systems thinking, feedback loops, HUMMBL:SY, HUMMBL:RE}
```

## 📝 Abstract Guidelines

### Length
- **Minimum**: 50 characters
- **Recommended**: 100-300 words
- **Maximum**: 500 words

### Content
- Use author's original abstract when available
- If summarizing, be objective and comprehensive
- Include key concepts and contributions
- Avoid marketing language
- Focus on intellectual content

### Formatting
- Single paragraph (no line breaks)
- No citations within abstract
- Standard punctuation only

## 🔑 Citation Keys

### Format
`AuthorYearShortTitle`

### Rules
- Single author: `Meadows2008ThinkingSystems`
- Two authors: `TverskyKahneman1974Judgment`
- Three+ authors: Use first author only
- Remove articles (a, an, the) from title
- CamelCase for readability
- Maximum 40 characters

### Examples
```
✅ Kahneman2011Thinking
✅ TverskyKahneman1974Judgment
✅ Meadows2008ThinkingSystems
❌ kahneman_2011  (wrong format)
❌ Kahneman2011ThinkingFastAndSlow  (too long)
```

## ✅ Validation Criteria

### Critical Errors (Block Merge)
- Missing required field
- Malformed DOI
- Malformed ISBN
- Duplicate citation key
- Invalid BibTeX syntax

### Warnings (Allow with Review)
- Missing DOI (for articles)
- Missing ISBN (for books)
- Short abstract (< 50 chars)
- No HUMMBL keywords

## 🎯 Tier Assignment Criteria

### T1: Canonical
- Foundational theoretical work
- Widely cited (500+ citations typically)
- Field-defining contribution
- 10+ years since publication (usually)
- Seminal text in discipline

### T2: Empirical
- Peer-reviewed research
- Published in reputable journal (impact factor > 2.0 typically)
- Rigorous methodology
- Significant citations (100+ typically)
- Reproducible findings

### T3: Applied
- Practitioner-focused
- Industry application
- Case studies and frameworks
- Accessible to non-academics
- Proven practical impact

## 🔍 Quality Checklist

Before submitting, verify:

**Structure**:
- [ ] Correct entry type (@book, @article, etc.)
- [ ] Valid citation key format
- [ ] All required fields present
- [ ] Proper BibTeX syntax

**Content**:
- [ ] Accurate bibliographic information
- [ ] Complete abstract (≥50 chars)
- [ ] Appropriate HUMMBL keywords
- [ ] Descriptive keywords included

**Formatting**:
- [ ] Author names in BibTeX format
- [ ] DOI in correct format (if present)
- [ ] ISBN with hyphens (if present)
- [ ] Page ranges with double hyphens
- [ ] Keywords properly formatted

**Validation**:
- [ ] Passes `npm run validate`
- [ ] No duplicates: `npm run check-dups`
- [ ] Appropriate tier assignment

## 🚫 Common Mistakes

### Wrong

```bibtex
@book{meadows2008,  % Bad: citation key not descriptive
  title = {thinking in systems},  % Bad: not title case
  author = {D. Meadows},  % Bad: abbreviated first name
  year = {2008},
  publisher = {Chelsea Green},
  isbn = {1603580557},  % Bad: missing hyphens
  abstract = {A book about systems.},  % Bad: too short
  keywords = {systems}  % Bad: no HUMMBL tags
}
```

### Right

```bibtex
@book{Meadows2008ThinkingSystems,
  title = {Thinking in Systems: A Primer},
  author = {Meadows, Donella H.},
  year = {2008},
  publisher = {Chelsea Green Publishing},
  isbn = {978-1603580557},
  abstract = {In the years following her role as the lead author of the international bestseller...},
  keywords = {systems thinking, feedback loops, HUMMBL:SY, HUMMBL:RE}
}
```

## 📚 Special Cases

### Edited Volumes
```bibtex
@book{SternbergDavidson1995Nature,
  title = {The Nature of Insight},
  editor = {Sternberg, Robert J. and Davidson, Janet E.},
  year = {1995},
  publisher = {MIT Press},
  isbn = {978-0262193986},
  ...
}
```

### Chapters in Edited Volumes
```bibtex
@incollection{Dunbar1995InVivo,
  title = {How Scientists Really Reason},
  author = {Dunbar, Kevin},
  year = {1995},
  booktitle = {The Nature of Insight},
  editor = {Sternberg, Robert J. and Davidson, Janet E.},
  publisher = {MIT Press},
  pages = {365--395},
  ...
}
```

### Multiple Editions
```bibtex
@book{Simon1996Sciences,
  title = {The Sciences of the Artificial},
  author = {Simon, Herbert A.},
  year = {1996},
  edition = {3rd},
  publisher = {MIT Press},
  ...
}
```

## 🔄 Updating Existing Entries

When improving existing entries:
1. Maintain original citation key
2. Add missing fields rather than replacing
3. Enhance abstracts if too short
4. Add DOIs if newly available
5. Refine HUMMBL keywords if needed

Document changes in commit message.

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue with the `quality` label.
