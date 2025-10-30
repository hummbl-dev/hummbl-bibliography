# Development Guide

## Pre-commit Hooks

This project uses [husky](https://typicode.github.io/husky/) to manage Git hooks. The following hooks are configured:

### Pre-commit Hook
- **What it does**: Runs validation on all bibliography files
- **When it runs**: Before each commit
- **How it works**:
  1. Validates all `.bib` files in the `bibliography` directory
  2. If validation fails, the commit is aborted
  3. If validation passes, the commit proceeds

### Bypassing the Hook

In rare cases, you might need to bypass the pre-commit hook:

```bash
# Skip pre-commit hook
git commit --no-verify -m "Your commit message"

# Or using the shorthand
git commit -n -m "Your commit message"
```

## Validation Rules

The validation enforces the following rules (configured in `.husky/validation-rules.json`):

1. Required fields for all entries:
   - `title`
   - `author`
   - `year`

2. Entry-type specific requirements:
   - `article`: Must include `journal`, `volume`, `number`, and `pages`
   - `book`: Must include `publisher` and `isbn`
   - `inproceedings`: Must include `booktitle` and `pages`

3. Format requirements:
   - DOI: Must match pattern `^10\.\d{4,9}/[-._;()/:A-Z0-9]+$`
   - Year: Must be 4 digits

## Troubleshooting

### Common Issues

1. **Hook not running**:
   - Ensure the pre-commit file is executable: `chmod +x .husky/pre-commit`
   - Verify husky is installed: `ls -la node_modules/.bin/husky`

2. **Validation fails**:
  ```bash
  # Run validation manually to see errors
  npm run validate
  
  # Check for duplicate entries
  npm run check-duplicates
  
  # Check for missing required fields
  npm run check-required-fields
  ```

3. **Husky not found**:
  ```bash
  # Install dependencies
  npm install
  
  # Initialize husky
  npx husky install
  ```

### Resolving Validation Errors

1. **Missing required fields**:
   - Check the error message for which fields are missing
   - Add the missing fields to the bibliography entry

2. **Duplicate entries**:
   - Run `npm run fix-dups` to automatically merge duplicates
   - Or manually resolve conflicts in the `.bib` files

3. **Format issues**:
   - Check that all fields have proper formatting
   - Ensure all braces and quotes are properly closed

## Development Workflow

1. Make changes to bibliography files
2. Stage your changes: `git add .`
3. Commit: `git commit -m "Your message"`
   - This will automatically run validation
4. Push your changes: `git push`

## Adding New Hooks

To add a new Git hook:

1. Create the hook file:
   ```bash
   npx husky add .husky/pre-push "npm test"
   chmod +x .husky/pre-push
   ```

2. Update documentation in this file

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
