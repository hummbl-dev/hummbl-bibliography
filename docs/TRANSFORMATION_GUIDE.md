# HUMMBL Transformation Guide

This guide explains the six cognitive transformations in the HUMMBL framework and provides guidance for mapping bibliography entries to appropriate transformations.

## 🎯 The Six Transformations

### P: Perspective

**Definition**: Observation, framing, lens-shifting, viewpoint changes

**Key Concepts**:
- Reframing problems from different angles
- Shifting between observer positions
- Recognizing frames and mental models
- Empathy and perspective-taking
- Context awareness and situational assessment

**Example Works**:
- Kahneman (2011): Dual-process perspective on thinking
- Norman (2013): User-centered design perspective
- Gibson (1979): Ecological perspective on perception
- Schön (1983): Reflective practice perspective

**Mapping Criteria**:
Assign **P** if the work:
- Explicitly discusses multiple viewpoints or frames
- Teaches methods for shifting perspective
- Analyzes how framing affects understanding
- Explores perception and observation processes

---

### IN: Inversion

**Definition**: Reversal, negation, contrapositive thinking, opposite approaches

**Key Concepts**:
- Thinking backwards from desired outcomes
- Exploring negative cases and failure modes
- Contrapositive reasoning (if not B, then not A)
- Paradoxical interventions
- Via negativa (defining by what something is not)

**Example Works**:
- Pearl (2009): Causal inversion and counterfactuals
- Taleb (2007): Inversion of predictability assumptions
- Wason (1968): Confirmation bias and hypothesis falsification
- Thaler (2008): Reverse psychology in choice architecture

**Mapping Criteria**:
Assign **IN** if the work:
- Uses reversal or negation as core method
- Explores opposite approaches to problems
- Discusses failure modes or negative cases
- Applies contrapositive reasoning

---

### CO: Composition

**Definition**: Building up, combining elements, synthesis from parts

**Key Concepts**:
- Assembling components into wholes
- Pattern composition and design patterns
- Building hierarchies and structures
- Combining strategies or heuristics
- Layering and scaffolding

**Example Works**:
- Alexander (1977): Pattern language composition
- Simon (1996): Composing artificial systems
- Gentner (1983): Structural mapping and analogy
- Miller (1956): Chunking and composition in memory

**Mapping Criteria**:
Assign **CO** if the work:
- Shows how to build complex from simple
- Discusses combination strategies
- Presents compositional frameworks
- Explores modular design and assembly

---

### DE: Decomposition

**Definition**: Breaking down, analysis into parts, chunking

**Key Concepts**:
- Analytical thinking and reduction
- Problem decomposition strategies
- Categorization and classification
- Modularization and separation of concerns
- Identifying components and relationships

**Example Works**:
- Simon (1955): Bounded rationality and satisficing
- Chi (1981): Expert categorization strategies
- Larkin (1980): Problem decomposition in expertise
- Gigerenzer (1996): Fast-and-frugal heuristic trees

**Mapping Criteria**:
Assign **DE** if the work:
- Emphasizes breaking down into parts
- Provides analytical frameworks
- Discusses categorization or classification
- Shows decomposition methodologies

---

### RE: Recursion

**Definition**: Self-reference, iterative processes, feedback loops

**Key Concepts**:
- Self-referential structures
- Feedback loops and cybernetics
- Iterative refinement
- Strange loops and tangled hierarchies
- Circular causality

**Example Works**:
- Hofstadter (1979): Self-reference and recursion
- Senge (1990): Feedback loops in systems
- Weick (1993): Recursive sensemaking
- Ries (2011): Build-measure-learn loops

**Mapping Criteria**:
Assign **RE** if the work:
- Explicitly discusses self-reference or recursion
- Emphasizes iterative processes
- Explores feedback mechanisms
- Deals with circular or cyclical patterns

---

### SY: Synthesis

**Definition**: Integration, holistic thinking, emergent properties

**Key Concepts**:
- Systems thinking and holism
- Emergent properties and complexity
- Integration across domains
- Gestalt and configuration
- Synthesis of multiple perspectives

**Example Works**:
- Meadows (2008): Systems synthesis
- Hutchins (1995): Distributed cognition synthesis
- Gladwell (2000): Network effects and tipping points
- Collins (2001): Integrative excellence frameworks

**Mapping Criteria**:
Assign **SY** if the work:
- Emphasizes holistic or systems thinking
- Discusses emergent properties
- Integrates multiple domains or perspectives
- Shows how parts create wholes greater than sum

---

## 🔄 Cross-Transformation Considerations

Many works span multiple transformations. Here's how to handle common combinations:

### CO + DE (Composition & Decomposition)
- Works on modular design
- Analysis-synthesis cycles
- Example: Miller (1956) on chunking

**Guideline**: Include both if work equally emphasizes building up AND breaking down.

### SY + RE (Synthesis & Recursion)
- Systems with feedback loops
- Emergent properties from iteration
- Example: Senge (1990), Meadows (2008)

**Guideline**: SY for holistic view, RE for cyclical processes.

### P + IN (Perspective & Inversion)
- Paradigm shifts
- Seeing from opposite viewpoints
- Example: Kuhn (1996), Kahneman (2011)

**Guideline**: P for framing changes, IN for reversal logic.

### All Six
- Comprehensive frameworks covering all aspects
- Rare: assign only most prominent 2-3

**Guideline**: Prioritize primary contribution over exhaustive tagging.

## 📊 Mapping Decision Tree

Use this process to map entries:

```
1. Read abstract and introduction
   ↓
2. Identify primary cognitive operation
   ↓
3. Check against transformation definitions
   ↓
4. Assign primary transformation (required)
   ↓
5. Identify secondary operations (optional, max 2)
   ↓
6. Verify with examples above
   ↓
7. Add to BibTeX keywords
```

## ✅ Mapping Best Practices

### Do:
- **Read carefully**: Base mapping on actual content, not just title
- **Be specific**: Choose transformations that work genuinely emphasizes
- **Limit tags**: 1-3 transformations maximum
- **Prioritize**: List primary transformation first in keywords
- **Provide rationale**: Explain mapping in PR or issue

### Don't:
- **Over-tag**: Avoid assigning all six transformations
- **Guess**: Don't map without reading or understanding content
- **Follow others blindly**: Each work should be evaluated independently
- **Ignore context**: Consider historical and disciplinary context

## 🎓 Transformation Interactions

Understanding how transformations relate:

```
P ←→ IN    (Perspective ↔ Inversion)
- Seeing from opposite angles

CO ←→ DE   (Composition ↔ Decomposition)
- Analysis-synthesis duality

RE ←→ SY   (Recursion ↔ Synthesis)
- Iterative emergence

P → SY     (Perspective → Synthesis)
- Multiple views enable integration

DE → CO    (Decomposition → Composition)
- Understanding parts enables assembly

All → SY   (All → Synthesis)
- Synthesis often requires all others
```

## 📚 Example Mappings

### Single Transformation

```bibtex
@book{Tufte2001VisualDisplay,
  keywords = {data visualization, information design, HUMMBL:P}
}
```
**Rationale**: Primarily about perspective and visual framing.

### Dual Transformation

```bibtex
@book{Pearl2009Causality,
  keywords = {causality, inference, causal models, HUMMBL:IN, HUMMBL:RE}
}
```
**Rationale**: Uses inversion (counterfactuals) and recursion (causal loops).

### Triple Transformation

```bibtex
@book{Meadows2008ThinkingSystems,
  keywords = {systems thinking, HUMMBL:SY, HUMMBL:RE, HUMMBL:CO}
}
```
**Rationale**: Synthesis (holistic systems), recursion (feedback), composition (system structure).

## 🔍 Edge Cases

### When work doesn't clearly fit?
- Choose closest match based on primary contribution
- Consult with maintainers via issue
- May be appropriate for multiple tiers

### When work fits all six?
- This is rare and often indicates over-tagging
- Choose 2-3 most prominent
- Focus on what work is known for

### When unsure between two?
- Consider the work's primary citation context
- What do others cite it for?
- When in doubt, choose fewer transformations

## 📝 Template for Mapping Rationale

When proposing mappings, use this template:

```markdown
**Primary Transformation**: [XX]
**Rationale**: [Work] focuses on [key concept] which aligns with 
[transformation] because it [demonstrates specific behavior].

**Secondary Transformations**: [YY, ZZ]
**Rationale**: The work also addresses [concept] ([YY]) and 
[concept] ([ZZ]), but these are secondary to its main contribution.
```

## 🎯 Quality Criteria

Good transformation mappings:
- ✅ Based on careful reading
- ✅ Justified with specific evidence
- ✅ Limited to 1-3 transformations
- ✅ Consistent with similar works
- ✅ Useful for users seeking that transformation

Poor transformation mappings:
- ❌ Based only on title or keywords
- ❌ No clear rationale
- ❌ Too many transformations (4+)
- ❌ Inconsistent with work's actual content
- ❌ Overly broad or generic

---

## 📖 Further Reading

- [QUALITY_STANDARDS.md](QUALITY_STANDARDS.md) - Entry formatting
- [CONTRIBUTING.md](CONTRIBUTING.md) - Submission process
- [GAP_ANALYSIS.md](GAP_ANALYSIS.md) - Current coverage

**Questions?** Open an issue with the `transformation-mapping` label.
