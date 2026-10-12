# Rule 05: Code Documentation and Comments

- **Inline Comments in Logical Functions**: Include clear, concise inline comments inside functions containing non-trivial business logic, complex data transformations, conditional branching, or algorithmic calculations.
- **Explain Intent and Rationale**: Focus comments on the "why" and underlying intent (edge cases, domain rules, non-obvious design decisions) rather than merely restating what the syntax does.
- **Preserve Existing Documentation**: Never delete, strip, or overwrite existing inline comments or docstrings during refactorings or code updates unless explicitly instructed by the user.
- **Maintain Accuracy**: Whenever modifying a logical function's behavior or flow, ensure relevant inline comments are kept up to date and consistent with the implementation.
