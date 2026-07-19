import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { preflightCheck, generateStats } from '../../harness/lib.mjs';

describe('harness pre-flight duplicate detection', () => {
  describe('preflightCheck against real bibliography', () => {
    it('detects duplicate citation keys', () => {
      const entries = [
        {
          key: 'Holland1998Emergence',
          title: 'Emergence: From Chaos to Order',
          author: 'Holland, John H.',
          year: '1998',
          file: 'T12_complexity.bib',
          type: 'book',
          isbn: '9780201149432',
        },
      ];
      const conflicts = preflightCheck(entries);
      assert.ok(conflicts.length > 0, 'should find conflicts for duplicate key');
      const keyConflict = conflicts.find(c => c.type === 'CITATION_KEY');
      assert.ok(keyConflict, 'should detect CITATION_KEY conflict');
      assert.equal(keyConflict.key, 'Holland1998Emergence');
    });

    it('detects duplicate titles (case-insensitive)', () => {
      const entries = [
        {
          key: 'UniqueKey12345',
          title: 'Hidden Order: How Adaptation Builds Complexity',
          author: 'Test, Author',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
      ];
      const conflicts = preflightCheck(entries);
      const titleConflict = conflicts.find(c => c.type === 'TITLE');
      assert.ok(titleConflict, 'should detect TITLE conflict');
      assert.equal(titleConflict.key, 'UniqueKey12345');
    });

    it('detects duplicate DOIs', () => {
      const entries = [
        {
          key: 'UniqueKeyDOI456',
          title: 'A Completely Unique Title That Does Not Exist',
          author: 'Test, Author',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'article',
          doi: '10.1126/science.177.4047.393',
        },
      ];
      const conflicts = preflightCheck(entries);
      const doiConflict = conflicts.find(c => c.type === 'DOI');
      assert.ok(doiConflict, 'should detect DOI conflict');
      assert.equal(doiConflict.key, 'UniqueKeyDOI456');
    });

    it('detects duplicate ISBNs', () => {
      const entries = [
        {
          key: 'UniqueKeyISBN789',
          title: 'Another Completely Unique Title',
          author: 'Test, Author',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
          isbn: '9780201149432',
        },
      ];
      const conflicts = preflightCheck(entries);
      const isbnConflict = conflicts.find(c => c.type === 'ISBN');
      assert.ok(isbnConflict, 'should detect ISBN conflict');
      assert.equal(isbnConflict.key, 'UniqueKeyISBN789');
    });

    it('passes for entries with no conflicts', () => {
      const entries = [
        {
          key: 'UniqueTestKeyNoConflict001',
          title: 'A Truly Unique Title For Testing Purposes Only 12345',
          author: 'TestAuthor, Unique',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
          doi: '10.9999/unique-test-doi-' + Date.now(),
          isbn: '9789999999999',
        },
      ];
      const conflicts = preflightCheck(entries);
      assert.equal(conflicts.length, 0, 'should find no conflicts for unique entry');
    });
  });

  describe('preflightCheck intra-batch detection', () => {
    it('detects duplicate keys within the same batch', () => {
      const entries = [
        {
          key: 'IntraBatchDup',
          title: 'First Unique Title',
          author: 'Author A',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
        {
          key: 'IntraBatchDup',
          title: 'Second Unique Title',
          author: 'Author B',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
      ];
      const conflicts = preflightCheck(entries);
      const batchKeyConflict = conflicts.find(c => c.type === 'BATCH_KEY');
      assert.ok(batchKeyConflict, 'should detect BATCH_KEY conflict');
      assert.equal(batchKeyConflict.key, 'IntraBatchDup');
    });

    it('detects duplicate titles within the same batch', () => {
      const entries = [
        {
          key: 'IntraBatchTitleA',
          title: 'Same Title In Batch',
          author: 'Author A',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
        {
          key: 'IntraBatchTitleB',
          title: 'same title in batch',
          author: 'Author B',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
      ];
      const conflicts = preflightCheck(entries);
      const batchTitleConflict = conflicts.find(c => c.type === 'BATCH_TITLE');
      assert.ok(batchTitleConflict, 'should detect BATCH_TITLE conflict (case-insensitive)');
    });

    it('detects duplicate DOIs within the same batch', () => {
      const entries = [
        {
          key: 'IntraBatchDoiA',
          title: 'Unique Title A',
          author: 'Author A',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'article',
          doi: '10.1234/intra-batch-dup',
        },
        {
          key: 'IntraBatchDoiB',
          title: 'Unique Title B',
          author: 'Author B',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'article',
          doi: '10.1234/intra-batch-dup',
        },
      ];
      const conflicts = preflightCheck(entries);
      const batchDoiConflict = conflicts.find(c => c.type === 'BATCH_DOI');
      assert.ok(batchDoiConflict, 'should detect BATCH_DOI conflict');
    });

    it('passes for a clean batch with no intra-batch or existing duplicates', () => {
      const entries = [
        {
          key: 'CleanBatchEntry001',
          title: 'Clean Batch Title 001 Unique',
          author: 'Author A',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
        {
          key: 'CleanBatchEntry002',
          title: 'Clean Batch Title 002 Unique',
          author: 'Author B',
          year: '2024',
          file: 'T12_complexity.bib',
          type: 'book',
        },
      ];
      const conflicts = preflightCheck(entries);
      assert.equal(conflicts.length, 0, 'should find no conflicts in clean batch');
    });
  });

  describe('generateStats', () => {
    it('returns a string with tier counts and total', () => {
      const stats = generateStats();
      assert.equal(typeof stats, 'string');
      assert.ok(stats.includes('TOTAL:'), 'stats should include TOTAL line');
      assert.ok(stats.includes('T1_canonical.bib:'), 'stats should include T1 tier');
      assert.ok(stats.includes('T13_reasoning.bib:'), 'stats should include T13 tier');
    });

    it('flags tiers below 20 entries', () => {
      const stats = generateStats();
      // All tiers should be at 20+ after our expansion
      // If any tier is below 20, it should have the <<< marker
      const belowThreshold = stats.split('\n').filter(l => l.includes('<<<'));
      // After Waves 1A-6, all tiers should be at 20+
      // This test documents the current state — if it fails, a tier dropped below 20
      assert.ok(belowThreshold.length === 0, `all tiers should be at 20+, but found: ${belowThreshold.join(', ')}`);
    });
  });
});
