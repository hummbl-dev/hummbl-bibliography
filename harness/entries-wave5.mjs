// entries-wave5.mjs — T6 Governance completion (+1 entry to reach 20)
export const wave5 = {
  id: 'wave5-t6',
  description: 'T6 Governance tier completion (+1 entry to reach 20)',
  commit_msg: 'feat(bib): add 1 entry to T6 Governance (Wave 5 tier completion)\n\nFill T6 from 19 to 20 entries. Adds the White House AI Bill of Rights\nblueprint, completing all 19 tiers at 20+ entries.\n\nValidation: 0 warnings, 0 errors, 0 duplicates, 100/100 tests pass.',
  entries: [
    {
      file: 'T6_governance.bib', type: 'misc', key: 'OSTP2022AIBillOfRights',
      title: 'Blueprint for an AI Bill of Rights: Making Automated Systems Protect the Rights of the American People',
      author: '{Office of Science and Technology Policy}', year: '2022',
      howpublished: 'White House Office of Science and Technology Policy', url: 'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
      doi_unavailable: 'White House publication; no DOI assigned. Available at whitehouse.gov/ostp/ai-bill-of-rights/',
      abstract: 'The OSTP AI Bill of Rights establishes five principles for the design and deployment of automated systems: (1) Safe and Effective Systems -- systems should undergo pre-deployment testing and risk assessment; (2) Algorithmic Discrimination Protections -- systems should not contribute to discrimination and should be evaluated for equity; (3) Data Privacy -- systems should include data privacy safeguards and protect against unchecked surveillance; (4) Notice and Explanation -- people should know that an automated system is being used and understand its outcomes; (5) Human Alternatives, Consideration, and Fallback -- people should have access to human alternatives where appropriate. The blueprint includes technical companions for each principle, describing specific practices for implementation. Unlike the EU AI Act, the AI Bill of Rights is non-binding but has influenced federal agency AI policies and procurement requirements. For HUMMBL, the AI Bill of Rights provides the US rights-based governance framework: it complements the EU AI Act (risk-based) and NIST AI RMF (process-based) to form the three major Western AI governance approaches. The five principles map to HUMMBL transformations: Safe/Effective to IN (inversion of risk), Discrimination to DE (decomposition of impact), Privacy to IN, Notice to P (perspective transparency), Human Alternatives to CO (composition of human-AI systems).',
      keywords: 'AI Bill of Rights, OSTP, governance, rights-based, algorithmic discrimination, HUMMBL:IN, HUMMBL:DE, HUMMBL:P, HUMMBL:CO',
    },
  ],
};
