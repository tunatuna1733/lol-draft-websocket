# lol-draft-websocket

This is the websocket backend server for [LoL Custom Tools](https://lol.tunatuna.dev) built on top of [`Bun.serve` feature](https://bun.sh/docs/api/http).

## Tech Stack
- [Bun](https://bun.sh/) (JavaScript runtime)

## Structure
```
└─src
    │  data.ts  : State management
    │  draft.ts : Main class for managing draft
    │  index.ts : Entry point
    │  util.ts  : Misc utility functions
    │
    ├─commands
    │  ├─draft  : Commands for draft tool
    │  └─team   : Commands for team creation tool
    └─types     : Type definitions
```