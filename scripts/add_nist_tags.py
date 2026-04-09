#!/usr/bin/env python3
"""
add_nist_tags.py — Inject nist_functions and eu_ai_act_articles fields
into T4, T6, and T11 BibTeX entries.

Maps each entry to:
  nist_functions = {GOVERN | MAP | MEASURE | MANAGE}  (NIST AI RMF)
  eu_ai_act_articles = {9, 12, 13, ...}               (EU AI Act articles)

Run from repo root:
    python scripts/add_nist_tags.py [--dry-run]
"""

import re
import sys
from pathlib import Path

BIB_DIR = Path(__file__).parent.parent / "bibliography"

# ── NIST AI RMF functions (AI RMF 1.0, Jan 2023)
# GOVERN: policies, accountability, culture
# MAP: context establishment, risk identification
# MEASURE: analysis, assessment, benchmarking
# MANAGE: prioritization, response, recovery
#
# EU AI Act key articles:
#  9  = Risk management system
# 10  = Data and data governance
# 11  = Technical documentation
# 12  = Record-keeping / audit logs
# 13  = Transparency and information
# 14  = Human oversight
# 15  = Accuracy, robustness, cybersecurity
# 16  = Obligations for high-risk AI providers
# 17  = Quality management system
# 50  = Obligations for GPAI providers
# 53  = Obligations for GPAI with systemic risk

CROSSWALK = {
    # ── T4 — Agentic AI ───────────────────────────────────────────────────────
    "Russell2019HumanCompatible": {
        "nist": "GOVERN MAP",
        "eu": "9 14",
        "rationale": "Value alignment and control problem — foundational for GOVERN (accountability) and MAP (risk identification); EU Art 9 (risk mgmt) and 14 (human oversight)"
    },
    "Amodei2016ConcreteProblems": {
        "nist": "MAP MEASURE MANAGE",
        "eu": "9 15",
        "rationale": "Concrete AI safety problems taxonomy — maps directly to MAP (hazard identification), MEASURE (evaluation), MANAGE (mitigation); Art 9 (risk mgmt) and 15 (robustness)"
    },
    "Christiano2017DeepRL": {
        "nist": "GOVERN MEASURE",
        "eu": "14 15",
        "rationale": "Reward learning from human feedback — GOVERN (alignment accountability), MEASURE (preference elicitation); Art 14 (human oversight), 15 (accuracy/robustness)"
    },
    "Bai2022ConstitutionalAI": {
        "nist": "GOVERN MEASURE",
        "eu": "13 50",
        "rationale": "Constitutional AI / RLHF — GOVERN (policy-driven AI behavior), MEASURE (harmlessness evaluation); Art 13 (transparency), 50 (GPAI model obligations)"
    },
    "Gabriel2020Values": {
        "nist": "GOVERN MAP",
        "eu": "9 13",
        "rationale": "Artificial intelligence, values and alignment — GOVERN (value specification), MAP (moral risk context); Art 9 (risk mgmt), 13 (transparency)"
    },
    "Leike2018Scalable": {
        "nist": "GOVERN MANAGE",
        "eu": "14",
        "rationale": "Scalable agent alignment via reward modeling — GOVERN (alignment at scale), MANAGE (control mechanisms); Art 14 (human oversight)"
    },
    "Hendrycks2022Unsolved": {
        "nist": "MAP MEASURE",
        "eu": "9 15",
        "rationale": "Unsolved AI safety problems survey — MAP (risk landscape), MEASURE (evaluation gaps); Art 9 (risk mgmt), 15 (robustness/accuracy)"
    },
    "Wooldridge2009MultiAgent": {
        "nist": "MAP GOVERN",
        "eu": "9",
        "rationale": "Multi-agent systems foundations — MAP (multi-agent risk context), GOVERN (agent coordination policies); Art 9 (risk mgmt for agentic systems)"
    },
    "Shoham2008Multiagent": {
        "nist": "MAP",
        "eu": "9",
        "rationale": "Multi-agent systems textbook — MAP (agent interaction risk modeling); Art 9 (risk mgmt)"
    },
    "Dorigo2006AntColony": {
        "nist": "MAP",
        "eu": "",
        "rationale": "Ant colony optimization — MAP (emergent behavior risk in swarm systems)"
    },
    "Durfee2001Distributed": {
        "nist": "MAP GOVERN",
        "eu": "9",
        "rationale": "Distributed problem solving — MAP (distributed risk), GOVERN (coordination governance); Art 9"
    },
    "Stone2000MultiagentSurvey": {
        "nist": "MAP",
        "eu": "9",
        "rationale": "Multi-agent systems survey — MAP (agent interaction risk landscape); Art 9"
    },
    "Park2023GenerativeAgents": {
        "nist": "MAP MEASURE",
        "eu": "9 13 14",
        "rationale": "Generative agents simulation — MAP (agent behavior risks), MEASURE (social simulation evaluation); Art 9, 13 (transparency), 14 (oversight)"
    },
    "Shostack2014ThreatModeling": {
        "nist": "MAP MANAGE",
        "eu": "9 15",
        "rationale": "Threat modeling for software developers — MAP (threat identification), MANAGE (threat response); Art 9 (risk mgmt), 15 (cybersecurity)"
    },
    "NIST2023AIRMF": {
        "nist": "GOVERN MAP MEASURE MANAGE",
        "eu": "9 11 12",
        "rationale": "NIST AI RMF itself — all four functions; EU Art 9 (risk mgmt), 11 (technical documentation), 12 (logging)"
    },
    "Lamport1978Clocks": {
        "nist": "MEASURE",
        "eu": "12",
        "rationale": "Logical clocks for distributed ordering — MEASURE (audit timeline accuracy); Art 12 (record-keeping)"
    },
    "Brewer2012CAP": {
        "nist": "MAP MANAGE",
        "eu": "15",
        "rationale": "CAP theorem for distributed systems — MAP (availability/consistency trade-offs), MANAGE (resilience design); Art 15 (robustness)"
    },
    "Floridi2018AI4People": {
        "nist": "GOVERN MAP",
        "eu": "9 13 14",
        "rationale": "AI4People ethical framework — GOVERN (ethics principles), MAP (societal risk); Art 9, 13 (transparency), 14 (human oversight)"
    },
    "Bostrom2014Superintelligence": {
        "nist": "MAP GOVERN",
        "eu": "9",
        "rationale": "Superintelligence existential risk — MAP (catastrophic risk horizon), GOVERN (control problem framing); Art 9 (risk mgmt)"
    },
    "Turing1950Computing": {
        "nist": "MAP",
        "eu": "",
        "rationale": "Computing machinery and intelligence — MAP (foundational AI risk framing)"
    },

    # ── T6 — Governance ───────────────────────────────────────────────────────
    "Rittel1973WickedProblems": {
        "nist": "MAP GOVERN",
        "eu": "9",
        "rationale": "Wicked problems — MAP (problem framing), GOVERN (policy design under ambiguity); Art 9 (risk mgmt)"
    },
    "EUAIAct2024": {
        "nist": "GOVERN MAP MEASURE MANAGE",
        "eu": "9 10 11 12 13 14 15 16 17 50 53",
        "rationale": "EU AI Act itself — all functions; comprehensive article coverage"
    },
    "OWASP2025LLM": {
        "nist": "MAP MANAGE",
        "eu": "9 15",
        "rationale": "OWASP LLM Top 10 — MAP (LLM attack surface), MANAGE (mitigation controls); Art 9 (risk mgmt), 15 (cybersecurity)"
    },
    "Dennis1966Capabilities": {
        "nist": "GOVERN MANAGE",
        "eu": "15",
        "rationale": "Capability-based access control — GOVERN (permission model), MANAGE (access control enforcement); Art 15 (robustness/security)"
    },
    "Sandhu1996RBAC": {
        "nist": "GOVERN MANAGE",
        "eu": "14 15",
        "rationale": "Role-based access control — GOVERN (authorization governance), MANAGE (access enforcement); Art 14 (human oversight controls), 15 (security)"
    },
    "Brundage2020Verifiable": {
        "nist": "GOVERN MEASURE",
        "eu": "11 12 13",
        "rationale": "Verifiable AI claims — GOVERN (accountability), MEASURE (claim verification); Art 11 (technical documentation), 12 (logging), 13 (transparency)"
    },
    "Sculley2015TechDebt": {
        "nist": "MANAGE MEASURE",
        "eu": "17",
        "rationale": "ML technical debt — MANAGE (debt remediation), MEASURE (system quality); Art 17 (quality management system)"
    },
    "Li2023TrustworthyAI": {
        "nist": "GOVERN MAP MEASURE",
        "eu": "9 13 15",
        "rationale": "Trustworthy AI survey — GOVERN (trust principles), MAP (trust risk), MEASURE (trust evaluation); Art 9, 13, 15"
    },
    "Liang2023HELM": {
        "nist": "MEASURE",
        "eu": "9 15",
        "rationale": "HELM evaluation framework — MEASURE (holistic LLM evaluation); Art 9 (risk assessment), 15 (accuracy)"
    },
    "Anthropic2024MCP": {
        "nist": "GOVERN MAP",
        "eu": "13 14",
        "rationale": "Model Context Protocol — GOVERN (agent tool-use governance), MAP (integration risk); Art 13 (transparency), 14 (human oversight)"
    },
    "ISO42001": {
        "nist": "GOVERN MAP MEASURE MANAGE",
        "eu": "9 11 12 17",
        "rationale": "ISO/IEC 42001 AI management system — all four NIST functions; Art 9 (risk mgmt), 11 (documentation), 12 (logging), 17 (QMS)"
    },
    "ISO27001": {
        "nist": "GOVERN MANAGE",
        "eu": "15",
        "rationale": "ISO 27001 information security — GOVERN (security policy), MANAGE (control implementation); Art 15 (cybersecurity)"
    },
    "SOC2Framework": {
        "nist": "GOVERN MEASURE",
        "eu": "11 13",
        "rationale": "SOC 2 trust service criteria — GOVERN (control objectives), MEASURE (audit evidence); Art 11 (documentation), 13 (transparency)"
    },
    "GDPR2016": {
        "nist": "GOVERN MAP MANAGE",
        "eu": "10 13",
        "rationale": "GDPR — GOVERN (data protection policy), MAP (data risk), MANAGE (compliance); Art 10 (data governance), 13 (transparency)"
    },
    "Abraham2019DataGovernance": {
        "nist": "GOVERN MAP",
        "eu": "10",
        "rationale": "Enterprise data governance — GOVERN (data policy), MAP (data risk landscape); Art 10 (data and data governance)"
    },
    "Raji2020Auditing": {
        "nist": "MEASURE GOVERN",
        "eu": "9 11 12",
        "rationale": "Closing the AI accountability gap — MEASURE (internal audit), GOVERN (accountability structures); Art 9, 11, 12"
    },
    "Mitchell2019ModelCards": {
        "nist": "MEASURE GOVERN",
        "eu": "11 13",
        "rationale": "Model cards for model reporting — MEASURE (capability documentation), GOVERN (transparency obligations); Art 11, 13"
    },
    "Gebru2021Datasheets": {
        "nist": "MEASURE GOVERN",
        "eu": "10 11",
        "rationale": "Datasheets for datasets — MEASURE (dataset documentation), GOVERN (data accountability); Art 10, 11"
    },
    "NISTRMF2023": {
        "nist": "GOVERN MAP MEASURE MANAGE",
        "eu": "9 11 12",
        "rationale": "NIST AI RMF 1.0 — all four functions; EU Art 9, 11, 12"
    },

    # ── T11 — Security ────────────────────────────────────────────────────────
    "Goodfellow2015Adversarial": {
        "nist": "MAP MEASURE",
        "eu": "9 15",
        "rationale": "Adversarial examples — MAP (adversarial attack surface), MEASURE (robustness evaluation); Art 9 (risk mgmt), 15 (robustness)"
    },
    "Carlini2017Evaluating": {
        "nist": "MEASURE",
        "eu": "15",
        "rationale": "Evaluating neural network robustness — MEASURE (adversarial robustness assessment); Art 15 (accuracy/robustness)"
    },
    "Biggio2018Wild": {
        "nist": "MAP MEASURE",
        "eu": "9 15",
        "rationale": "Wild patterns: adversarial examples survey — MAP (attack taxonomy), MEASURE (robustness evaluation); Art 9, 15"
    },
    "Saltzer1975Protection": {
        "nist": "GOVERN MANAGE",
        "eu": "15",
        "rationale": "Protection of information in computer systems — GOVERN (security design principles), MANAGE (least privilege, fail-safe); Art 15 (cybersecurity)"
    },
    "Rose2020ZeroTrust": {
        "nist": "GOVERN MANAGE",
        "eu": "14 15",
        "rationale": "Zero trust architecture — GOVERN (trust policy), MANAGE (continuous verification); Art 14 (human oversight), 15 (security)"
    },
    "Birgisson2014Macaroons": {
        "nist": "GOVERN MANAGE",
        "eu": "14 15",
        "rationale": "Macaroons: contextual caveats for authorization — GOVERN (delegation policy), MANAGE (caveat enforcement); Art 14, 15"
    },
    "Perez2022RedTeaming": {
        "nist": "MAP MEASURE",
        "eu": "9 15",
        "rationale": "Red teaming LLMs — MAP (attack surface identification), MEASURE (vulnerability testing); Art 9 (risk assessment), 15 (robustness)"
    },
    "Katz2017Reluplex": {
        "nist": "MEASURE",
        "eu": "15",
        "rationale": "Reluplex formal neural network verification — MEASURE (formal robustness verification); Art 15 (accuracy/robustness)"
    },
    "Papernot2016Distillation": {
        "nist": "MANAGE MEASURE",
        "eu": "15",
        "rationale": "Distillation as defense — MANAGE (robustness improvement), MEASURE (defense evaluation); Art 15"
    },
    "Shokri2017Membership": {
        "nist": "MAP MEASURE",
        "eu": "10 15",
        "rationale": "Membership inference attacks — MAP (privacy attack surface), MEASURE (privacy risk); Art 10 (data governance), 15 (robustness)"
    },
    "Papernot2018SoK": {
        "nist": "MAP MEASURE MANAGE",
        "eu": "9 15",
        "rationale": "SoK: Limitations of machine learning for security — MAP (ML security limits), MEASURE (failure mode evaluation), MANAGE (mitigations); Art 9, 15"
    },
    "Guo2024Threats": {
        "nist": "MAP",
        "eu": "9 15",
        "rationale": "Threats to AI systems taxonomy — MAP (comprehensive threat landscape); Art 9 (risk mgmt), 15 (cybersecurity)"
    },
    "Dwork2006DifferentialPrivacy": {
        "nist": "MANAGE MEASURE",
        "eu": "10 15",
        "rationale": "Differential privacy — MANAGE (privacy-preserving ML), MEASURE (privacy guarantee); Art 10, 15"
    },
    "Castro1999PBFT": {
        "nist": "MANAGE",
        "eu": "15",
        "rationale": "Practical Byzantine fault tolerance — MANAGE (distributed system resilience); Art 15 (robustness)"
    },
    "Gentry2009Homomorphic": {
        "nist": "MANAGE",
        "eu": "15",
        "rationale": "Fully homomorphic encryption — MANAGE (computation on encrypted data); Art 15 (security)"
    },
    "SLSA2023SupplyChain": {
        "nist": "MAP MANAGE",
        "eu": "15",
        "rationale": "SLSA supply chain security — MAP (supply chain risk), MANAGE (provenance controls); Art 15 (cybersecurity)"
    },
    "MITRE2024ATLAS": {
        "nist": "MAP MANAGE",
        "eu": "9 15",
        "rationale": "MITRE ATLAS adversarial threat landscape — MAP (ML threat taxonomy), MANAGE (mitigations); Art 9, 15"
    },
    "Ohrimenko2016SecureEnclaves": {
        "nist": "MANAGE",
        "eu": "15",
        "rationale": "Oblivious ML on trusted processors — MANAGE (confidential compute); Art 15 (security)"
    },
    "Lyu2020FederatedSecurity": {
        "nist": "MAP MANAGE",
        "eu": "10 15",
        "rationale": "Threats to federated learning — MAP (federated attack surface), MANAGE (defenses); Art 10, 15"
    },
    "Greshake2023PromptInjection": {
        "nist": "MAP MANAGE",
        "eu": "9 15",
        "rationale": "Indirect prompt injection attacks — MAP (LLM-integrated app threat), MANAGE (injection defenses); Art 9, 15"
    },
}


def inject_tags(content, key, nist, eu, dry_run=False):
    """Insert nist_functions and eu_ai_act_articles fields after the keywords field."""
    # Find the entry block for this key
    entry_pattern = re.compile(
        r'(@\w+\{' + re.escape(key) + r',[\s\S]*?)(?=\n@|\Z)',
        re.MULTILINE
    )
    m = entry_pattern.search(content)
    if not m:
        return content, False

    entry = m.group(1)

    # Skip if already tagged
    if 'nist_functions' in entry:
        return content, False

    # Find insertion point: after keywords field (may or may not have trailing comma)
    kw_pattern = re.compile(r'(keywords\s*=\s*\{[^}]*\})\s*,?\s*\n', re.MULTILINE)
    kw_m = kw_pattern.search(entry)
    if not kw_m:
        return content, False

    # Build new fields
    new_fields = []
    if nist:
        new_fields.append(f'  nist_functions     = {{{nist}}}')
    if eu:
        new_fields.append(f'  eu_ai_act_articles = {{{eu}}}')
    if not new_fields:
        return content, False

    # Replace keywords field: ensure trailing comma, then append new fields
    kw_replacement = kw_m.group(1) + ',\n' + ',\n'.join(new_fields) + ',\n'
    entry_start = m.start()
    kw_abs_start = entry_start + kw_m.start()
    kw_abs_end = entry_start + kw_m.end()
    insert_pos = kw_abs_end  # unused; we replace directly below
    new_content = content[:kw_abs_start] + kw_replacement + content[kw_abs_end:]

    if dry_run:
        print(f"  {key}: nist={nist!r} eu={eu!r}")
        return content, True

    return new_content, True
    new_content = content[:insert_pos] + insertion + content[insert_pos:]

    if dry_run:
        print(f"  {key}: would add nist={nist!r} eu={eu!r}")
        return content, True

    return new_content, True


def main():
    dry_run = '--dry-run' in sys.argv

    bib_files = {
        'T4': BIB_DIR / 'T4_agentic.bib',
        'T6': BIB_DIR / 'T6_governance.bib',
        'T11': BIB_DIR / 'T11_security.bib',
    }

    total_patched = 0
    total_skipped = 0

    for tier, bib_path in sorted(bib_files.items()):
        content = bib_path.read_text()
        patched = 0
        skipped = 0

        for key, mapping in CROSSWALK.items():
            nist = mapping['nist'].strip()
            eu = mapping['eu'].strip()
            new_content, changed = inject_tags(content, key, nist, eu, dry_run)
            if changed:
                content = new_content
                patched += 1
            elif key in content:
                skipped += 1  # already tagged or no keywords field

        if not dry_run and patched > 0:
            bib_path.write_text(content)

        total_patched += patched
        total_skipped += skipped
        print(f"{tier}: {patched} patched, {skipped} already done or skipped")

    print(f"\nTotal: {total_patched} entries tagged, {total_skipped} skipped")
    if dry_run:
        print("(DRY RUN — no files written)")


if __name__ == "__main__":
    main()
