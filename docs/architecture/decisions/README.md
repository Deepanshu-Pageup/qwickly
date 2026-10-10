# Architecture Decision Records (ADRs)

## Purpose
This directory contains Architecture Decision Records (ADRs) for the Qwickly project. ADRs document significant architectural decisions, including context, options considered, decisions made, and trade-offs/consequences.

## Standard Format
ADRs should follow the Markdown Architectural Decision Record (MADR) format:

```markdown
# [NNNN]. [Short Title of Decision]

## Status
[Proposed | Accepted | Superseded | Deprecated]

## Context
[What is the problem or architectural need being addressed? What options were considered?]

## Decision
[What is the chosen approach and key rationale?]

## Consequences
[What are the positive and negative consequences, trade-offs, or follow-up actions?]
```

## Naming Convention
Files must be named using a 4-digit sequential zero-padded number followed by a short hyphenated title:
`XXXX-short-title.md` (e.g., `0001-use-prisma-orm.md`).

## Governance & Creation Policy
> [!IMPORTANT]
> **On-Demand Creation Only**: ADRs must be created **ONLY when explicitly requested by the user**.  
> The AI assistant may recommend documenting an architectural decision when appropriate, but **must never create an ADR automatically** without explicit user request.
