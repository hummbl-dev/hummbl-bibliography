AAR: Phase -1A HUMMBL Atomic Claims Inventory + Billing Outage Policy | INTERNAL | 20260714-1705Z | devin
═══════════════════════════════════════════════════════════════════

## 1. Mission & Intent (P6: Point-of-View Anchoring)
- **Objective**: Extract atomic claims from canonical HUMMBL source files, create a JSON-schema-validated claims registry, produce method documentation and an audit report, commit and push to remote, and establish a temporary operating policy for the GitHub Actions billing outage.
- **Success criteria**: (a) 4 artifacts created (schema, registry, method doc, audit report); (b) JSON validates against schema with all generated_counts verified; (c) commit GPG-signed and pushed; (d) draft PR updated with billing outage disclosure; (e) full local CI-equivalent validation receipt produced.
- **Constraints**: No `is_background: true` subagents. No `--no-verify`. No vendor attribution in commit messages. No direct pushes to main. No bypassing branch protection. Missing CI checks must not be treated as passing.

## 2. Chronology (RE17: Versioning & Diff)
| Time/Commit | Action | Result |
|-------------|--------|--------|
| Prior session | RFC committed (docs/HUMMBL_BIBLIOGRAPHY_SCOPE_AND_EXPANSION_RFC.md) | 11 corrections from adversarial review applied |
| Prior session | BKI source files read (THEORY_MASTER, HRSI, hummbl-primitives, biocognitive-assessment) | 6 canonical sources identified |
| Prior session | Existing schema registry discovered at schemas/bibliography-schema-registry-v0.1.schema.json | Conventions aligned (registry_id, registry_status, last_reviewed_at, generated_counts pattern) |
| 485292b | Created schemas/hummbl_claim.v0.1.schema.json | JSON Schema 2020-12, 248 lines |
| 485292b | Created claims/hummbl_claims.v0.1.json | 32 claims, 701 lines |
| 485292b | Created docs/HUMMBL_CLAIMS_REGISTRY_METHOD.md | 169 lines |
| 485292b | Created reports/HUMMBL_CLAIMS_INVENTORY_AUDIT.md | 221 lines |
| 485292b | Schema validation (ajv 2020-12) | PASS — but generated_counts mismatched actual array (theoretical: 9 vs 7, operational: 9 vs 11, unresolved: 8 vs 7) |
| 485292b | Fixed generated_counts + added missing unresolved:true on CON-SUCCESSION-MODE | Re-validated: ALL CHECKS PASSED |
| 485292b | git commit (GPG-signed) | Commit rejected — vendor attribution detected ("Generated with [Devin]") |
| 485292b | Removed attribution lines, re-committed | Commit blocked — GPG pinentry popup hidden by window-hider watchdog |
| 485292b | Diagnosed: pinentry-w32.exe GUI suppressed by watchdog | Added allow-loopback-pinentry to gpg-agent.conf, restarted gpg-agent |
| 485292b | Operator unlocked GPG via loopback pinentry in own terminal | Cache warm for 2 hours |
| 485292b | git commit succeeded | 485292b, GPG Good signature (G), 4 files, 1339 insertions |
| 485292b | git push origin fix/codex/bibliography-schema-registry-audit-fix | Success — no Actions triggered (branch not in any push trigger scope) |
| Post-push | Operator directive: adopt billing outage operating policy | Policy written to docs/GITHUB_ACTIONS_BILLING_OUTAGE_POLICY.md |
| Post-push | Workflow trigger audit (all 9 workflows) | No pull_request_target, merge_group, workflow_run, repository_dispatch, or reusable workflows found |
| Post-push | Full local CI-equivalent validation (10 surfaces) | All PASS: 94 tests, type-check, build, audit (0 vulns), gitleaks (no leaks), model validation (0 hallucinations), beyond-base120 (0 errors), commitlint, claims schema |
| b91da8e | Validation receipt saved to reports/VALIDATION_RECEIPT_485292b.md | 193 lines, includes CI-equivalence matrix |
| b91da8e | git commit + push | b91da8e, GPG Good signature (G), 2 files, 299 insertions |
| b91da8e | PR #113 updated (title, body, CI_UNAVAILABLE_BILLING disclosure) | Draft PR, 4 commits, https://github.com/hummbl-dev/hummbl-bibliography/pull/113 |

## 3. Outcome vs Plan (IN17: Counterfactual Negation)
- **Planned**: Create 4 artifacts, validate, commit, push, done.
- **Actual**: 6 artifacts created (4 claims registry + policy + validation receipt). 3 blockers hit and resolved (generated_counts mismatch, vendor attribution rejection, GPG pinentry suppression). Full CI-equivalent validation run that wasn't in the original plan but was mandated by operator directive.
- **Delta**:
  - +2 artifacts beyond plan (policy, validation receipt) — caused by operator's billing outage policy directive
  - +1 validation cycle (full 10-surface CI-equivalent) — caused by same directive
  - 3 blockers resolved that cost real time: counts mismatch, attribution, GPG
  - 0 Actions triggered on push (verified, not assumed) — receipt: workflow trigger audit

## 4. Root Causes (DE1: Root Cause Analysis)

### Deviation 1: generated_counts mismatched actual array contents
- Why 1: Two claims were mis-classified as `theoretical` when their source quotes described operational protocols (OPS-HRSI-DIMENSIONS, OPS-HRSI-OPERATOR-GATING were counted as theoretical in the header but classified as operational in the claim objects)
- Why 2: generated_counts was written before all claim evidence_tier values were finalized; the header was not updated after the last classification changes
- Why 3: No automated count-verification step in the creation workflow — counts were written by hand and not cross-checked against the array until the validation script ran
- **Root cause**: Manual count aggregation without a verification gate before first validation

### Deviation 2: CON-SUCCESSION-MODE missing unresolved:true
- Why 1: The claim had a risks array but the unresolved flag was not set
- Why 2: The extraction process flagged risks mentally but did not consistently propagate the flag
- **Root cause**: No checklist enforcing "every claim with risks[] must have unresolved:true"

### Deviation 3: Vendor attribution in commit message rejected
- Why 1: Commit message included "Generated with [Devin]" and "Co-Authored-By: Devin" lines
- Why 2: The system prompt's git instructions specify this format, but the repo has a commit-msg hook that rejects vendor attribution (per ~/.agents/rules/no-vendor-attribution.md)
- **Root cause**: System prompt git instructions conflict with repo-local no-vendor-attribution rule; the repo rule wins at hook time but the agent didn't check for it before composing the message

### Deviation 4: GPG pinentry popup suppressed
- Why 1: The window-hider watchdog (recently modified to mitigate terminal popups) suppressed pinentry-w32.exe
- Why 2: gpg-agent.conf had no pinentry-program override, defaulting to the GUI popup
- Why 3: The watchdog mitigation was applied without exempting GPG pinentry
- **Root cause**: Watchdog mitigation did not account for GPG pinentry as a legitimate GUI popup

## 5. Sustains (RE16: Retrospective -> Prospective Loop)
- **Schema-first approach worked** — creating the schema before the data caught structural issues early and made validation deterministic. Evidence: ajv validation passed on first correct run, all counts verifiable.
- **Existing convention alignment** — matching the bibliography-schema-registry-v0.1 pattern (registry_id, registry_status, generated_counts) made the new schema consistent with the existing corpus. Evidence: schema structure mirrors existing registry.
- **Subagent source exploration** — dispatching a subagent to search for canonical sources across PROJECTS/ and .agents/ was efficient and kept the main context clean. Evidence: 6 canonical sources identified in one dispatch.
- **Operator directive integration** — the billing outage policy was adopted immediately and comprehensively, with a durable doc, trigger audit, full validation, and receipt. Evidence: docs/GITHUB_ACTIONS_BILLING_OUTAGE_POLICY.md, reports/VALIDATION_RECEIPT_485292b.md.
- **Loopback pinentry fix** — adding `allow-loopback-pinentry` to gpg-agent.conf is a durable fix that prevents future watchdog conflicts. Evidence: gpg-agent.conf updated, commit succeeded after operator unlock.
- **No-vendor-attribution rule caught the violation** — the commit-msg hook rejected the first attempt, preventing a policy violation from landing. Evidence: commit rejection message.

## 6. Improves (IN20: Antigoals & Anti-Patterns Catalog)
- **generated_counts mismatched actual data** — the header counts were wrong on first validation. Evidence: first validation showed theoretical: 9 vs 7, operational: 9 vs 11, unresolved: 8 vs 7.
- **unresolved flag not consistently set** — CON-SUCCESSION-MODE had risks but no unresolved:true. Evidence: first validation showed unresolved_count: 8 vs actual: 7.
- **Vendor attribution in commit message** — wasted a commit attempt. Evidence: commit rejection, had to rewrite message.
- **GPG pinentry blocked by watchdog** — cost a full diagnostic cycle (PATH issues, pinentry-program investigation, loopback config, operator unlock). Evidence: 3 failed commit attempts before success.
- **Node 20 and Node 24 not available locally** — CI matrix cannot be fully reproduced. Evidence: validation receipt lists these as NOT REPRODUCED.
- **No bus entry posted during the session** — the session produced significant findings (billing outage policy, validation method, GPG fix) but no bus messages were posted. Evidence: bus tail shows watchdog STATUS entries only, no claims-registry or AAR entries.

## 7. Recommendations (DE7: Pareto Decomposition)
1. **[HIGH]** Add a count-verification script to the claims registry workflow — run `node -e` count check before first validation and before every commit. Addresses: generated_counts mismatch.
2. **[HIGH]** Check for repo-local commit-msg rules before composing commit messages — read `.husky/commit-msg` and any referenced rule files before writing the message. Addresses: vendor attribution rejection.
3. **[HIGH]** Exempt GPG pinentry from the window-hider watchdog or document loopback pinentry as the standard unlock method. Addresses: GPG pinentry suppression.
4. **[MED]** Install Node 20 and Node 24 locally (nvm-windows or similar) to enable full CI matrix reproduction during Actions outages. Addresses: Node version gap.
5. **[MED]** Post bus entries for significant milestones during the session, not just at AAR time. Addresses: no bus entries during session.
6. **[LOW]** Add a pre-commit checklist item: "every claim with risks[] must have unresolved:true". Addresses: unresolved flag inconsistency.

---
Base120 Applied: P6, RE17, IN17, DE1, RE16, IN20, DE7
Evidence: commits 485292b, b91da8e; PR #113; reports/VALIDATION_RECEIPT_485292b.md; reports/HUMMBL_CLAIMS_INVENTORY_AUDIT.md; docs/GITHUB_ACTIONS_BILLING_OUTAGE_POLICY.md; gpg-agent.conf
Bus: Y (posting now)
