// research-updates.mjs — File grounding contract issues in hummbl-research
// Run after bibliography harness completes
import { execFileSync } from 'child_process';
import { log } from './lib.mjs';

const RESEARCH_REPO = 'C:\\Users\\Owner\\PROJECTS\\hummbl-research';

function fileIssue(title, body, labels) {
  try {
    // Use execFileSync with argument array to avoid shell injection via
    // titles/bodies containing backticks, $(), quotes, or other metacharacters.
    const args = ['issue', 'create', '--title', title, '--body', body];
    if (labels) {
      args.push('--label', labels);
    }
    const out = execFileSync('gh', args, { cwd: RESEARCH_REPO, encoding: 'utf8', timeout: 30000 });
    log(`  Issue filed: ${out.trim()}`);
    return out.trim();
  } catch (err) {
    log(`  Issue filing FAILED: ${err.message}`);
    return null;
  }
}

const issues = [
  {
    title: 'Wave 2B: CO (Composition) operator re-validation to 7.0+ with 8 new grounding entries',
    body: `## Wave 2B — CO Re-Validation

### Context
Wave 2A added 8 new bibliography entries grounding the CO (Composition) transformation:
- Holland1998Emergence (T12): emergence theory, constrained generating procedures
- Anderson1972MoreIsDifferent (T12): broken symmetry, composition changes behavior
- Simon1962Architecture (T5): near-decomposability, hierarchical composition
- Alexander1979TimelessBuilding (T3): pattern language, compositional design
- Gamma1994DesignPatterns (T5): pattern composition in software
- Arthur2009Technology (T3): combinatorial evolution of technology
- Page2017Diversity (T12): diversity prediction theorem
- Frenken2006Innovation (T9): recombinant innovation, NK model

### Task
Re-validate all CO-tagged operators in Base120 against the expanded bibliography. Target: CO operator average score >= 7.0 (VALIDATED status).

### Acceptance Criteria
- [ ] All CO-tagged operators scored against new entries
- [ ] Average CO score >= 7.0
- [ ] Validation results committed to hummbl-research
- [ ] Grounding contract updated with new citations

### References
- Expansion plan: EXPANSION_PLAN_2026-07-18.md
- Bibliography commits: see hummbl-bibliography git log for Wave 2A commit`,
    labels: 'grounding-contract,wave-2b,composition',
  },
  {
    title: 'Wave 3B: T14-T19 tier completion grounding contracts (6 tiers filled to 20 entries)',
    body: `## Wave 3B — Tier Completion Grounding Contracts

### Context
Wave 3A filled T14-T19 to 20 entries each in hummbl-bibliography:
- T14 Provenance: +8 entries (C2PA, SynthID, Stable Signature, deepfake regulation)
- T15 Maturity: +5 entries (ISO 42001, OECD classification, AI readiness, Google/Microsoft models)
- T16 Data Governance: +13 entries (EU Data Act, FAIR, datasheets, model cards, data trusts)
- T17 Privacy: +13 entries (PATE, secure aggregation, MIA, model inversion, DP foundations)
- T18 Human Oversight: +10 entries (human-AI teaming, cognitive forcing, MHC, trust repair)
- T19 Incident Response: +10 entries (AI incident taxonomy, model recall, RCA for ML, rollback)

### Task
For each tier, create a grounding contract that maps the new entries to Base120 operators and validates operator scores.

### Acceptance Criteria
- [ ] T14 grounding contract created and validated
- [ ] T15 grounding contract created and validated
- [ ] T16 grounding contract created and validated
- [ ] T17 grounding contract created and validated
- [ ] T18 grounding contract created and validated
- [ ] T19 grounding contract created and validated
- [ ] All affected operators scored against new entries

### References
- Expansion plan: EXPANSION_PLAN_2026-07-18.md
- Bibliography commits: see hummbl-bibliography git log for Wave 3A commits`,
    labels: 'grounding-contract,wave-3b,tier-completion',
  },
  {
    title: 'Wave 4B: ARCANA lens re-validation with 14 social theory entries',
    body: `## Wave 4B — ARCANA Lens Re-Validation

### Context
Wave 4A added 14 social theory entries to fill ARCANA lenses that had zero primary citations:
- Bourdieu1977OutlineTheory (T2): habitus, field, cultural capital
- Weber1922EconomySociety (T1): rationalization, ideal types, iron cage
- Burnham1941ManagerialRevolution (T1): managerialism
- Chomsky1988ManufacturingConsent (T1): propaganda model
- Gramsci1929PrisonNotebooks (T1): cultural hegemony, organic intellectual
- Marx1867Capital (T1): surplus value, commodity fetishism
- Nietzsche1887Genealogy (T1): genealogical method, power-morality
- Habermas1981CommunicativeAction (T2): lifeworld-system, communicative action
- Heidegger1954QuestionTechnology (T1): enframing, standing reserve
- McLuhan1964UnderstandingMedia (T1): medium is the message
- Veblen1899LeisureClass (T1): conspicuous consumption
- Pareto1935MindSociety (T1): residues, elite circulation
- IbnKhaldun1377Muqaddimah (T1): asabiyyah, cyclical history
- Bateson1972EcologyMind (T2): ecology of mind, double bind

### Task
Re-validate ARCANA lenses that were previously ungrounded. Each lens should now have at least one primary citation. Update lens descriptions to reference the new grounding.

### Acceptance Criteria
- [ ] All 14 ARCANA lenses with new entries mapped to their corresponding lenses
- [ ] Each previously-ungrounded lens now has >= 1 primary citation
- [ ] Lens descriptions updated with grounding references
- [ ] Validation results committed to hummbl-research

### References
- Expansion plan: EXPANSION_PLAN_2026-07-18.md
- Bibliography commits: see hummbl-bibliography git log for Wave 4A commit`,
    labels: 'grounding-contract,wave-4b,arcana',
  },
];

log('\n=== RESEARCH-SIDE UPDATES: Filing grounding contract issues ===');
for (const issue of issues) {
  log(`\nFiling: ${issue.title}`);
  fileIssue(issue.title, issue.body, issue.labels);
}
log('\nResearch-side updates complete.');
