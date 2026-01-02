# REQUIRED WORKFLOW (follow exactly)

## Before starting
1. Run `date` and record the timestamp
2. Read AGENTS.md and AGENTS_GHA.md
3. Break the task into small steps that represent a unit of work that can be committed to the remote without causing compilation issues or test failures

## For every completed step
1. Make the fix
2. Run `yarn format && yarn lint && yarn compile` in project root
3. Fix any remaining formatting, linting (error level only, biome option `--diagnostic-level=error`) or compilation issues introduced by your changes
4. Create a commit with a clear message
5. Push to remote immediately
6. Run `date` and check elapsed time
7. If >30 minutes have passed: commit with message "WIP: further work required", push, then STOP

## References
- Consult AGENTS.md and AGENTS_GHA.md for all actions
