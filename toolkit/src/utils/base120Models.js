/**
 * Canonical Base120 model reference list.
 *
 * Extracted into a runtime JS module so scripts can load the model
 * registry without depending on a prebuilt dist output.
 */

export const BASE120_MODELS = {
  P: [
    'First Principles Framing', 'Stakeholder Mapping', 'Identity Stack',
    'Lens Shifting', 'Empathy Mapping', 'Point-of-View Anchoring',
    'Perspective Switching', 'Narrative Framing', 'Cultural Lens Shifting',
    'Context Windowing', 'Role Perspective-Taking', 'Temporal Framing',
    'Spatial Framing', 'Reference Class Framing', 'Assumption Surfacing',
    'Identity-Context Reciprocity', 'Frame Control & Reframing',
    'Boundary Object Selection', 'Sensemaking Canvases', 'Worldview Articulation'
  ],
  IN: [
    'Subtractive Thinking', 'Premortem Analysis', 'Problem Reversal',
    'Contra-Logic', 'Negative Space Framing', 'Inverse/Proof by Contradiction',
    'Boundary Testing', 'Contrapositive Reasoning', 'Backward Induction',
    'Red Teaming', "Devil's Advocate Protocol", 'Failure First Design',
    'Opportunity Cost Focus', 'Second-Order Effects (Inverted)',
    'Constraint Reversal', 'Inverse Optimization', 'Counterfactual Negation',
    'Kill-Criteria & Stop Rules', 'Harm Minimization (Via Negativa)',
    'Antigoals & Anti-Patterns Catalog'
  ],
  CO: [
    'Synergy Principle', 'Chunking', 'Functional Composition',
    'Interdisciplinary Synthesis', 'Emergence', 'Gestalt Integration',
    'Network Effects', 'Layered Abstraction', 'Interface Contracts',
    'Pipeline Orchestration', 'Pattern Composition (Tiling)',
    'Modular Interoperability', 'Cross-Domain Analogy', 'Platformization',
    'Combinatorial Design', 'System Integration Testing',
    'Orchestration vs Choreography', 'Knowledge Graphing',
    'Multi-Modal Integration', 'Holistic Integration'
  ],
  DE: [
    'Root Cause Analysis (5 Whys)', 'Factorization', 'Modularization',
    'Layered Breakdown', 'Dimensional Reduction', 'Taxonomy/Classification',
    'Pareto Decomposition (80/20)', 'Work Breakdown Structure',
    'Signal Separation', 'Abstraction Laddering', 'Scope Delimitation',
    'Constraint Isolation', 'Failure Mode Analysis (FMEA)',
    'Variable Control & Isolation', 'Decision Tree Expansion',
    'Hypothesis Disaggregation', 'Orthogonalization',
    'Scenario Decomposition', 'Critical Path Unwinding',
    'Partition-and-Conquer'
  ],
  RE: [
    'Recursive Improvement (Kaizen)', 'Feedback Loops',
    'Meta-Learning (Learn-to-Learn)', 'Nested Narratives',
    'Fractal Reasoning', 'Recursive Framing', 'Self-Referential Logic',
    'Bootstrapping', 'Iterative Prototyping', 'Compounding Cycles',
    'Calibration Loops', 'Bayesian Updating in Practice',
    'Gradient Descent Heuristic', 'Spiral Learning',
    'Convergence-Divergence Cycling', 'Retrospective→Prospective Loop',
    'Versioning & Diff', 'Anti-Catastrophic Forgetting',
    'Auto-Refactor', 'Recursive Governance (Guardrails that Learn)'
  ],
  SY: [
    'Leverage Points', 'System Boundaries', 'Stocks & Flows',
    'Requisite Variety', 'Systems Archetypes', 'Feedback Structure Mapping',
    'Path Dependence', 'Homeostasis/Dynamic Equilibrium',
    'Phase Transitions & Tipping Points', 'Causal Loop Diagrams',
    'Governance Patterns', 'Protocol/Interface Standards',
    'Incentive Architecture', 'Risk & Resilience Engineering',
    'Multi-Scale Alignment', 'Ecosystem Strategy', 'Policy Feedbacks',
    'Measurement & Telemetry', 'Meta-Model Selection',
    'Systems-of-Systems Coordination'
  ]
};
