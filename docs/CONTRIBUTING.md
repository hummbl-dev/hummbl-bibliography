# Contributing to HUMMBL Bibliography

Thank you for your interest in contributing to the HUMMBL Bibliography project! This document provides guidelines for contributing to this repository.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Making Changes

### Adding Bibliography Entries

When adding new bibliography entries, follow these guidelines:

1. **Choose the correct tier:**
   - **Tier 1 (Core)**: Foundational works that define core concepts
   - **Tier 2 (Applied)**: Practical applications and implementations
   - **Tier 3 (Emerging)**: Recent developments and future directions

2. **Follow BibTeX standards:**
   - Use proper entry types (@article, @book, @inproceedings, etc.)
   - Include all required fields (author, title, year, etc.)
   - Add descriptive keywords for categorization

3. **Use consistent citation keys:**
   - Format: `firstauthor[year][keyword]`
   - Example: `newell1990unified`, `anderson2004integrated`

4. **Add keywords:**
   - Include relevant keywords for easier searching
   - Use consistent keyword naming conventions

### Example Entry

```bibtex
@article{author2023example,
  title={An Example Article Title},
  author={Author, First and Author, Second},
  journal={Journal Name},
  volume={10},
  number={2},
  pages={123--145},
  year={2023},
  publisher={Publisher Name},
  keywords={keyword1, keyword2, keyword3}
}
```

## Validation

Before submitting your changes, run the validation suite:

```bash
# Run all validations
npm run validate

# Run specific validations
npm run validate:bibtex      # Check BibTeX syntax
npm run validate:duplicates  # Check for duplicate keys
npm run validate:keywords    # Validate keywords
npm run validate:tiers       # Check tier structure

# Generate statistics
npm run stats

# Export to other formats
npm run export
```

## Pre-commit Hooks

This repository uses Husky for pre-commit hooks. The validation suite will automatically run before each commit to ensure code quality.

## Pull Request Process

1. Ensure all validations pass
2. Update documentation if necessary
3. Write a clear PR description explaining your changes
4. Reference any related issues
5. Wait for CI checks to pass
6. Request review from maintainers

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic
- Keep scripts modular and reusable

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (Node.js version, OS, etc.)

## Questions?

Feel free to open an issue for any questions or concerns about contributing.
