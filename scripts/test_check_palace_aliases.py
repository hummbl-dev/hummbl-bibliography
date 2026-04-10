"""
Tests for check_palace_aliases.py

Run: python3 -m pytest scripts/test_check_palace_aliases.py -v
  or: python3 scripts/test_check_palace_aliases.py
"""

import sys
import unittest
from pathlib import Path

# Allow running as a script or via pytest from repo root
sys.path.insert(0, str(Path(__file__).parent))
from check_palace_aliases import extract_string_values, parse_entries, detect_collisions


class TestExtractStringValues(unittest.TestCase):
    def test_single_quoted(self):
        self.assertEqual(extract_string_values("'hello world'"), ['hello world'])

    def test_double_quoted(self):
        self.assertEqual(extract_string_values('"hello world"'), ['hello world'])

    def test_double_quoted_with_apostrophe(self):
        self.assertEqual(extract_string_values('"Occam\'s razor"'), ["Occam's razor"])

    def test_multiple_single_quoted(self):
        self.assertEqual(
            extract_string_values("'anti-fragility', 'antifragile'"),
            ['anti-fragility', 'antifragile']
        )

    def test_multiple_double_quoted(self):
        self.assertEqual(
            extract_string_values('"Occam\'s razor", "Ockham\'s razor"'),
            ["Occam's razor", "Ockham's razor"]
        )

    def test_mixed_quotes(self):
        result = extract_string_values("'OODA', \"ooda loop\"")
        self.assertEqual(result, ['OODA', 'ooda loop'])

    def test_empty_input(self):
        self.assertEqual(extract_string_values(''), [])

    def test_no_quotes(self):
        self.assertEqual(extract_string_values('bareIdentifier'), [])


class TestParseEntries(unittest.TestCase):
    MINIMAL_SOURCE = """
export const MEMORY_PALACE = [
  {
    slug: 'via-negativa',
    room: 'TALEB',
    canonical_name: 'Via Negativa',
    aliases: ['subtraction principle'],
    source: 'Nassim Nicholas Taleb',
    description: 'Improvement via removal',
    tags: ['risk'],
  },
  {
    slug: 'antifragility',
    room: 'TALEB',
    canonical_name: 'Antifragility',
    aliases: ['Anti-fragility', 'antifragile'],
    source: 'Nassim Nicholas Taleb',
    description: 'Systems that gain from disorder',
    tags: ['risk'],
  },
];
"""

    DOUBLE_QUOTE_SOURCE = """
export const MEMORY_PALACE = [
  {
    slug: 'occams-razor',
    room: 'EPISTEMICS',
    canonical_name: "Occam's Razor",
    aliases: ["Ockham's razor", 'parsimony principle'],
    source: 'William of Ockham',
    description: 'Simplest explanation preferred',
    tags: ['epistemics'],
  },
];
"""

    def test_parses_single_quoted_entry(self):
        entries = parse_entries(self.MINIMAL_SOURCE)
        self.assertEqual(len(entries), 2)
        self.assertEqual(entries[0]['slug'], 'via-negativa')
        self.assertEqual(entries[0]['canonical_name'], 'Via Negativa')
        self.assertEqual(entries[0]['aliases'], ['subtraction principle'])

    def test_parses_multiple_aliases(self):
        entries = parse_entries(self.MINIMAL_SOURCE)
        self.assertEqual(entries[1]['aliases'], ['Anti-fragility', 'antifragile'])

    def test_parses_double_quoted_canonical(self):
        entries = parse_entries(self.DOUBLE_QUOTE_SOURCE)
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['canonical_name'], "Occam's Razor")

    def test_parses_double_quoted_aliases(self):
        entries = parse_entries(self.DOUBLE_QUOTE_SOURCE)
        self.assertIn("Ockham's razor", entries[0]['aliases'])

    def test_empty_source(self):
        entries = parse_entries('')
        self.assertEqual(entries, [])


class TestDetectCollisions(unittest.TestCase):
    def test_no_collisions(self):
        entries = [
            {'slug': 'a', 'canonical_name': 'Alpha', 'aliases': ['beta']},
            {'slug': 'b', 'canonical_name': 'Gamma', 'aliases': ['delta']},
        ]
        self.assertEqual(detect_collisions(entries), [])

    def test_canonical_vs_alias_self_collision(self):
        # 'Via Negativa' canonical collides with 'via negativa' alias (the historic bug)
        entries = [
            {'slug': 'via-negativa', 'canonical_name': 'Via Negativa', 'aliases': ['via negativa']},
        ]
        result = detect_collisions(entries)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['key'], 'via negativa')
        self.assertEqual(result[0]['first']['field'], 'canonical_name')
        self.assertEqual(result[0]['second']['field'], 'alias')

    def test_cross_entry_collision(self):
        entries = [
            {'slug': 'a', 'canonical_name': 'Black Swan', 'aliases': []},
            {'slug': 'b', 'canonical_name': 'Black Swan Event', 'aliases': ['black swan']},
        ]
        result = detect_collisions(entries)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['key'], 'black swan')

    def test_apostrophe_collision_double_quotes(self):
        # "Occam's razor" alias collides with canonical "Occam's Razor"
        entries = [
            {
                'slug': 'occams-razor',
                'canonical_name': "Occam's Razor",
                'aliases': ["Occam's razor", 'parsimony principle'],
            },
        ]
        result = detect_collisions(entries)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['key'], "occam's razor")

    def test_survivorship_bias_collision(self):
        # 'Survivorship bias' alias collides with 'Survivorship Bias' canonical
        entries = [
            {
                'slug': 'survivorship-bias',
                'canonical_name': 'Survivorship Bias',
                'aliases': ['Survivorship bias', 'survival bias'],
            },
        ]
        result = detect_collisions(entries)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['key'], 'survivorship bias')

    def test_multiple_collisions_reported(self):
        entries = [
            {'slug': 'a', 'canonical_name': 'Alpha', 'aliases': ['alpha']},
            {'slug': 'b', 'canonical_name': 'Beta', 'aliases': ['beta']},
        ]
        result = detect_collisions(entries)
        self.assertEqual(len(result), 2)


class TestAgainstLiveFile(unittest.TestCase):
    """Integration test: run against the actual memoryPalace.ts."""

    def test_live_file_has_no_collisions(self):
        live_path = Path(__file__).parent.parent / "toolkit" / "src" / "extensions" / "memoryPalace.ts"
        if not live_path.exists():
            self.skipTest(f"memoryPalace.ts not found at {live_path}")
        source = live_path.read_text(encoding="utf-8")
        entries = parse_entries(source)
        self.assertGreater(len(entries), 0, "Expected at least one entry")
        collisions = detect_collisions(entries)
        self.assertEqual(
            collisions, [],
            f"Live memoryPalace.ts has alias collisions: {collisions}"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
