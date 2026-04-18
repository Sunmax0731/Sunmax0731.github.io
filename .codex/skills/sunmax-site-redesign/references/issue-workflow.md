# Issue Workflow

## Intake And Execution

- Treat Issue creation and implementation as separate phases.
- Capture new redesign requests as GitHub Issues first.
- Do not start implementation until the user confirms priority or otherwise asks to proceed.
- Treat one Issue as the planning unit and scope boundary for the work in progress.

## While Implementing

- Keep the Issue title, body, and acceptance criteria aligned with the actual planned slice.
- If scope changes materially, update the Issue before or together with the implementation.
- Feed design decisions back into `Design.md` when they become part of the accepted direction.

## Closing And Reporting

- Update or close the Issue only after the relevant local changes are reflected in the repository state the user wants to keep.
- When posting progress to GitHub, keep the update concrete: what changed, what is next, and what is still blocked.

## GitHub CLI Encoding On Windows PowerShell 5.1

- Do not pipe Japanese multi-line text to `gh` through stdin.
- Prefer UTF-8 body files for `gh issue edit --body-file` and `gh issue comment --body-file`.
- When title and body both need non-ASCII text, prefer `gh api` with a UTF-8 JSON input file.
- Read the Issue or comment back after posting or editing Japanese text to confirm it was stored without mojibake.
