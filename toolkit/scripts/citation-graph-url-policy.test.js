import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeOutboundUrl } from '../src/citation-graph-url-policy.js';

test('allows safe http and https URLs', () => {
  assert.equal(normalizeOutboundUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(normalizeOutboundUrl('http://example.com/path?q=1'), 'http://example.com/path?q=1');
});

test('rejects unsafe URL schemes', () => {
  assert.equal(normalizeOutboundUrl('javascript:alert(1)'), null);
  assert.equal(normalizeOutboundUrl('data:text/html,<script>'), null);
  assert.equal(normalizeOutboundUrl('file:///etc/passwd'), null);
  assert.equal(normalizeOutboundUrl('ftp://files.example.com'), null);
});

test('rejects protocol-relative and malformed links', () => {
  assert.equal(normalizeOutboundUrl('//example.com/resource'), null);
  assert.equal(normalizeOutboundUrl('/relative/path'), null);
  assert.equal(normalizeOutboundUrl('not a url'), null);
  assert.equal(normalizeOutboundUrl(''), null);
});
