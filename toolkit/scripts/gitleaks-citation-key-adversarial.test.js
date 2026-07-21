import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

describe('gitleaks citation-key adversarial coverage', () => {
  it('catches a realistic secret in a generated-citation-map payload', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gitleaks-adversarial-'));
    try {
      // Write a faux grounding map containing both citation keys and a realistic secret.
      const payload = JSON.stringify(
        {
          schema_version: '1.0',
          sources: [
            { key: 'Alexander1977Pattern', title: 'Pattern Language' },
            { key: 'Test_Secret_API_Key_1234567890ABCDEF', title: 'Fake Secret' },
          ],
        },
        2,
      );
      writeFileSync(join(dir, 'scientific-grounding-map.json'), payload);

      const reportPath = join(dir, 'report.json');
      try {
        execSync(
          `gitleaks detect --config .gitleaks.toml --no-git --source ${join(dir, 'scientific-grounding-map.json')} --report-path ${reportPath}`,
          { cwd: REPO_ROOT, encoding: 'utf8' },
        );
        assert.fail('expected gitleaks to find the realistic secret');
      } catch (e) {
        // Expected to fail when leaks are found.
      }

      const raw = readFileSync(reportPath, 'utf8');
      const findings = JSON.parse(raw);
      assert.ok(findings.length > 0, 'expected at least one gitleaks finding');
      const fake = findings.find((f) => f.Secret === 'Test_Secret_API_Key_1234567890ABCDEF');
      assert.ok(fake, 'expected finding for the realistic secret');
      assert.strictEqual(fake.RuleID, 'generic-api-key');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not flag citation-key values in dist/scientific-grounding-map.json when allowlisted', () => {
    const reportPath = join(tmpdir(), 'gitleaks-dist-report.json');
    try {
      execSync(
        'gitleaks detect --config .gitleaks.toml --no-git --source dist/scientific-grounding-map.json --report-path ' +
          reportPath,
        { cwd: REPO_ROOT, encoding: 'utf8' },
      );
      assert.fail('expected gitleaks to exit non-zero');
    } catch (e) {
      // Expected to fail if findings exist; we expect none with allowlist in place.
    }

    const raw = readFileSync(reportPath, 'utf8');
    const findings = JSON.parse(raw);
    assert.strictEqual(findings.length, 0, 'expected zero findings in dist after allowlist');
  });
});
