# GitHub Actions Billing Outage — Temporary Operating Policy

**Status**: ACTIVE
**Adopted**: 2026-07-14
**Scope**: All repositories under `hummbl-dev/` until GitHub Actions billing is restored
**Authority**: Principal Agent directive

---

## Core Principle

**Git commits, Git pushes, GitHub pull requests, GitHub Actions execution, and protected-branch merges are separate control surfaces.** The outage disables or degrades one surface (Actions); it does not eliminate the others, and it does not make their risks equivalent.

**Missing or non-running checks must never be interpreted as passing checks.**

---

## Permitted

### 1. Local commits

- Preserve GPG signing.
- Do not use `--no-verify`.
- Record the exact commit SHA and validation results.

### 2. Feature-branch pushes

- Permitted only after a **repo-specific workflow-trigger audit**.
- Check all relevant event types, not only `push`: `pull_request`, `pull_request_target`, `merge_group`, tags/releases, `workflow_run`, `repository_dispatch`, and reusable workflows.
- Confirm that the branch is not covered by a wildcard or unexpected path rule.

### 3. Draft pull requests

- May be opened for durable review, discussion, and diff preservation.
- Clearly mark them `CI_UNAVAILABLE_BILLING`.
- Missing or non-running checks must never be interpreted as passing checks.

---

## Default Hold

Do not merge into `main`, `master`, `develop`, release branches, or other protected branches unless **all** of the following exist:

1. Explicit Principal Agent authorization.
2. A repository-specific manual validation receipt.
3. Successful execution of the closest local equivalent to every required CI job.
4. An independent diff review.
5. Confirmation that no required server-side check or ruleset is being bypassed.
6. A documented rollback path.

---

## Prohibited During the Outage

- Direct pushes to default or protected branches.
- Bypassing hooks with `--no-verify`.
- Force-pushing shared branches.
- Weakening branch protection or rulesets to enable a merge.
- Treating an absent check as a successful check.
- Publishing tags, releases, packages, or deployment artifacts without an explicit release-specific audit.
- Modifying CI workflows and then relying solely on those modified workflows for validation.

---

## Manual Validation Standard

Do not assume that any standard set of commands fully reproduces CI. Inspect the workflow files and `package.json` for each repository, then produce an exact local CI-equivalence matrix.

### Required validation surfaces (where applicable)

- Tests
- Bibliography/schema validation
- Lint and type checking
- Commit-message validation
- A full relevant-diff secret scan, not merely staged-file scanning
- Dependency/security audit
- Model-name or hallucination validation
- Testing under both Node 20 and Node 24, matching the CI matrix
- Clean working-tree confirmation
- Final diff and changed-path review

### Validation receipt format

Each merge candidate must have a machine-readable or Markdown validation receipt containing:

- Repository and branch
- Base and head SHAs
- Commit signature status
- Changed files and risk classification
- Commands executed
- Tool/runtime versions
- Exit codes and summarized outputs
- Validations not reproduced locally
- Reviewer identity
- Merge recommendation: `HOLD`, `MANUAL_GATE_ELIGIBLE`, or `DO_NOT_MERGE`

---

## Restoration

When GitHub Actions billing is restored:

1. Confirm Actions are executing by checking a recent workflow run.
2. Re-run any workflows that were skipped during the outage for merged branches.
3. Retire this policy by moving it to `docs/archive/` and updating any references.
4. Do not retroactively treat the outage period as validated — any merges made under manual validation remain manually validated, not CI-validated.
