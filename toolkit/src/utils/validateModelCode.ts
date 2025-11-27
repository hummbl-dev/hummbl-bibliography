/**
 * HUMMBL Base120 Model Validator
 * Prevents LLM hallucination by validating model codes against official list
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
} as const;

export type TransformationType = keyof typeof BASE120_MODELS;
export type ModelCode = `${TransformationType}${number}`;

export interface ValidationResult {
  isValid: boolean;
  code?: ModelCode;
  name?: string;
  transformation?: TransformationType;
  error?: string;
}

/**
 * Validates a mental model code against the official Base120 framework
 *
 * @param code - Model code (e.g., "P1", "IN15", "CO7")
 * @returns Validation result with model details or error
 *
 * @example
 * validateModelCode("P1")  // { isValid: true, code: "P1", name: "First Principles Framing", ... }
 * validateModelCode("P21") // { isValid: false, error: "Model number must be 1-20" }
 * validateModelCode("XX1") // { isValid: false, error: "Invalid transformation code" }
 */
export function validateModelCode(code: string): ValidationResult {
  // Parse code format: [P|IN|CO|DE|RE|SY][1-20]
  const match = code.match(/^(P|IN|CO|DE|RE|SY)(\d+)$/);

  if (!match) {
    return {
      isValid: false,
      error: `Invalid format: "${code}". Expected format: [P|IN|CO|DE|RE|SY][1-20]`
    };
  }

  const [, transformation, numStr] = match;
  const modelNum = parseInt(numStr, 10);

  // Validate transformation type
  if (!(transformation in BASE120_MODELS)) {
    return {
      isValid: false,
      error: `Invalid transformation code: "${transformation}". Valid codes: P, IN, CO, DE, RE, SY`
    };
  }

  // Validate model number (1-20)
  if (modelNum < 1 || modelNum > 20) {
    return {
      isValid: false,
      error: `Model number must be 1-20. Got: ${modelNum}`
    };
  }

  // Get model name from array (0-indexed)
  const transformationKey = transformation as TransformationType;
  const modelName = BASE120_MODELS[transformationKey][modelNum - 1];

  return {
    isValid: true,
    code: code as ModelCode,
    name: modelName,
    transformation: transformationKey
  };
}

/**
 * Gets model name from code
 */
export function getModelName(code: string): string | null {
  const result = validateModelCode(code);
  return result.isValid ? result.name! : null;
}

/**
 * Lists all models for a transformation
 */
export function getTransformationModels(transformation: TransformationType): readonly string[] {
  return BASE120_MODELS[transformation];
}

/**
 * Checks if a string is likely a hallucinated model (not in Base120)
 */
export function isLikelyHallucination(text: string): boolean {
  const hallucinatedModels = [
    'OODA Loop', 'Hanlon\'s Razor', 'Occam\'s Razor',
    'Mental Model', 'Systems Thinking', 'Second-Order Thinking',
    'Probabilistic Thinking', 'Map vs Territory', 'Feedback Loops',
    'Circle of Competence', 'Comparative Advantage', 'Signaling',
    'Antifragility', 'Survivorship Bias', 'Black Swan',
    'Regression to the Mean'
  ];

  return hallucinatedModels.some(hallucinated =>
    text.toLowerCase().includes(hallucinated.toLowerCase())
  );
}
