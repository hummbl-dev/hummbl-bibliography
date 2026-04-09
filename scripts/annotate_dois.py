#!/usr/bin/env python3
"""
annotate_dois.py — Apply DOI fields and % No DOI available annotations
to all entries currently missing both.

Run from repo root:
    python scripts/annotate_dois.py [--dry-run]

Adds either:
  doi = {10.xxxx/...},           (for entries with verified CrossRef DOIs)
  % No DOI available -- reason   (for entries without DOIs)
"""
import re
import sys
from pathlib import Path

BIB_DIR = Path(__file__).parent.parent / "bibliography"

# ── Verified DOIs (CrossRef confirmed, title + year match) ────────────────────
CONFIRMED_DOIS = {
    "Grasse1959Stigmergy": "10.1007/bf02223791",        # Insectes Sociaux, Springer, 1959
    "Sabater2005Trust": "10.1007/s10462-004-0041-5",    # Artificial Intelligence Review, Springer, 2005
    "Bansal2019MentalModels": "10.1609/hcomp.v7i1.5285", # AAAI HCOMP 2019
    "Piaget1952Origins": "10.1037/11494-000",            # APA PsycBooks, 1952
}

# ── % No DOI available reasons ─────────────────────────────────────────────────
NO_DOI_REASONS = {
    # T1
    "Lakoff1980MetaphorsWeLive": "pre-DOI era monograph (published 1980); no registered DOI",
    "Tufte2001VisualDisplay":    "trade book; no registered DOI for this edition",
    "Alexander1977Pattern":      "pre-DOI era monograph (published 1977); no registered DOI",
    "Senge1990FifthDiscipline":  "trade business book; no registered DOI for this edition",
    # T2
    "Dunbar1995InVivo":          "book chapter; DOI not found via CrossRef",
    "Hutchins1995Cognition":     "MIT Press monograph; no registered CrossRef DOI for this edition",
    # T4
    "Russell2019HumanCompatible": "trade book (Viking/Penguin); no registered DOI",
    "Wooldridge2009MultiAgent":  "trade book (Wiley); no registered DOI for this edition",
    "Shoham2008Multiagent":      "textbook (Cambridge UP); chapter DOIs exist but book-level DOI not registered",
    "Shostack2014ThreatModeling": "trade book (Wiley); no registered DOI for this edition",
    "Bostrom2014Superintelligence": "trade book (Oxford UP); no registered CrossRef DOI",
    # T5
    "Nygard2018ReleaseIt":       "trade book (Pragmatic Programmers); no registered DOI",
    "Rao1995BDI":                "conference paper (ICMAS 1995); DOI not found via CrossRef or AAAI/IEEE/ACM",
    "YoungCQRS":                 "practitioner blog post on cqrs.nu; no registered DOI",
    "Mahdavi2013FeatureToggles": "practitioner blog post; no registered DOI",
    "Kreps2013Log":              "practitioner blog post on LinkedIn Engineering Blog; no registered DOI",
    "Sridharan2018Observability": "practitioner blog post; no registered DOI",
    "Newman2021Microservices":   "trade book (O'Reilly); no registered DOI for this edition",
    "Beyer2016SRE":              "trade book (O'Reilly); no registered DOI for this edition",
    "Morris2016InfrastructureAsCode": "trade book (O'Reilly); no registered DOI for this edition",
    "Rosenthal2020ChaosEngineeringBook": "trade book (O'Reilly); no registered DOI for this edition",
    # T6
    "EUAIAct2024":               "EU legislative act (EUR-Lex 2024/1689); DOI not registered",
    "OWASP2025LLM":              "practitioner web resource (owasp.org); no registered DOI",
    "Sculley2015TechDebt":       "conference paper (NeurIPS 2015); DOI not found via CrossRef or AAAI/IEEE/ACM",
    "Anthropic2024MCP":          "technical specification (Anthropic blog/GitHub); no registered DOI",
    "ISO42001":                  "ISO standard; DOI not registered",
    "NISTRMF2023":               "technical report (NIST AI 100-1); DOI not registered",
    # T8
    "Craik1943NatureExplanation": "pre-DOI era monograph (published 1943); no registered DOI",
    "Norman1991CognitiveArtifacts": "book chapter in Designing Interaction (Carroll ed.); DOI not found via CrossRef",
    "Luhmann1981Zettelkasten":   "German journal article (Bielefeld 1981); DOI not found via CrossRef",
    "Spiro1990CognitiveFlexibility": "conference proceedings (Hillsdale 1990); DOI not found via CrossRef",
    # T9
    "Zachariadis2012API":        "working paper / SSRN preprint; no final publication DOI registered",
    "Buterin2014Ethereum":       "white paper / technical specification; no registered DOI",
    # T10
    "Vicente1999CognitiveWorkAnalysis": "trade book (Lawrence Erlbaum); no registered CrossRef DOI",
    # T11
    "Goodfellow2015Adversarial": "conference paper (ICLR 2015 workshop); DOI not found via CrossRef or AAAI/IEEE/ACM",
    "Guo2024Threats":            "technical report / preprint; DOI not found via CrossRef",
    "SLSA2023SupplyChain":       "practitioner web resource (slsa.dev); no registered DOI",
    "MITRE2024ATLAS":            "practitioner web resource (atlas.mitre.org); no registered DOI",
    "Ohrimenko2016SecureEnclaves": "conference paper (USENIX Security 2016); DOI not found via CrossRef or USENIX",
    # T12
    "Holland1995HiddenOrder":    "trade book (Addison-Wesley); no registered DOI",
    "Prigogine1984Order":        "trade book (Bantam Books); no registered DOI for this edition",
    "Beer1981Brain":             "trade book (Wiley); no registered DOI for this edition",
    "Wright1932Roles":           "pre-DOI era journal article (published 1932); no registered DOI",
    "Bonabeau1999SwarmIntelligence": "trade book (Oxford UP); no registered CrossRef DOI",
}


def find_last_identifier_field(entry_block):
    """Return the end position (within entry_block) after the last identifier field
    (doi, isbn, url) or after the year/author field if none found.
    We insert the doi or annotation comment here, before abstract."""
    # Look for abstract — insert just before it
    abstract_m = re.search(r'\n(\s*abstract\s*=)', entry_block)
    if abstract_m:
        return abstract_m.start()  # position of the \n before abstract
    # Fallback: end of entry
    return len(entry_block) - 1


def has_doi_or_annotation(entry_block):
    return (re.search(r'^\s*doi\s*=', entry_block, re.MULTILINE) or
            re.search(r'%\s*No DOI available', entry_block))


def add_doi(content, key, doi, dry_run=False):
    """Add doi = {10.xxx/...}, before the abstract field."""
    entry_re = re.compile(
        r'(@\w+\{' + re.escape(key) + r',([\s\S]*?))(?=\n@|\Z)', re.MULTILINE)
    m = entry_re.search(content)
    if not m:
        return content, False

    entry = m.group(1)
    if has_doi_or_annotation(entry):
        return content, False

    # Insert before abstract
    abs_m = re.search(r'\n(\s*abstract\s*=)', entry)
    if not abs_m:
        return content, False

    insert_at = m.start() + abs_m.start()
    doi_line = f'\n  doi                = {{{doi}}},'

    if dry_run:
        print(f"  ADD doi: {key} → {doi}")
        return content, True

    new_content = content[:insert_at] + doi_line + content[insert_at:]
    return new_content, True


def add_no_doi_comment(content, key, reason, dry_run=False):
    """Add % No DOI available comment before the abstract field."""
    entry_re = re.compile(
        r'(@\w+\{' + re.escape(key) + r',([\s\S]*?))(?=\n@|\Z)', re.MULTILINE)
    m = entry_re.search(content)
    if not m:
        return content, False

    entry = m.group(1)
    if has_doi_or_annotation(entry):
        return content, False

    # Find the last field before abstract — look for abstract position
    abs_m = re.search(r'\n(\s*abstract\s*=)', entry)
    if not abs_m:
        return content, False

    insert_at = m.start() + abs_m.start()
    comment = f'\n  % No DOI available -- {reason}'

    if dry_run:
        print(f"  ADD annotation: {key} → {reason[:60]}")
        return content, True

    new_content = content[:insert_at] + comment + content[insert_at:]
    return new_content, True


def process_file(bib_path, dry_run=False):
    content = bib_path.read_text()
    doi_added = 0
    annotation_added = 0

    for key, doi in CONFIRMED_DOIS.items():
        new_content, changed = add_doi(content, key, doi, dry_run)
        if changed:
            content = new_content
            doi_added += 1

    for key, reason in NO_DOI_REASONS.items():
        new_content, changed = add_no_doi_comment(content, key, reason, dry_run)
        if changed:
            content = new_content
            annotation_added += 1

    if not dry_run and (doi_added + annotation_added) > 0:
        bib_path.write_text(content)

    return doi_added, annotation_added


def main():
    dry_run = '--dry-run' in sys.argv

    bib_files = sorted(BIB_DIR.glob('*.bib'))
    total_doi = 0
    total_ann = 0

    for bib_path in bib_files:
        tier = re.match(r'(T\d+)', bib_path.name)
        tier = tier.group(1) if tier else '??'
        d, a = process_file(bib_path, dry_run)
        if d + a > 0:
            print(f"{tier} ({bib_path.name}): +{d} doi, +{a} annotations")
        total_doi += d
        total_ann += a

    print(f"\nTotal: {total_doi} DOIs added, {total_ann} annotations added")
    if dry_run:
        print("(DRY RUN)")


if __name__ == "__main__":
    main()
