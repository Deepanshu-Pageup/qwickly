# Rule 04: Workflow and Git

- **Rule Precedence**: Architecture Boundaries > Workflow > Framework Conventions.
- **Plan Statuses**: Use distinct statuses for plans (`status: proposed` vs `status: approved`).
- **Approval Scope**: Approval applies ONLY to the approved scope. Expanding scope requires renewed explicit approval.
- **Git Policy**:
  - **Read-Only Inspection**: `git status`, `git log`, `git diff`, and file reading are permitted by default for analysis and verification.
  - **State-Changing Git Operations**: Operations such as `git commit`, `git add`, `git push`, `git checkout`, `git branch`, `git merge`, `git reset`, or `git rebase` are **strictly prohibited** without explicit user authorization.
- **Independent Review**: Every major change set must undergo an independent Git diff review before declaring completion.
