            ┌────────────────────────────┐
            │         EXPRESS            │
            │ route errors → middleware  │
            └────────────────────────────┘

                ⬇ Hors Express ⬇

┌───────────────────────┐
│ unhandledRejection    │  ← erreurs async
└───────────────────────┘

┌───────────────────────┐
│ uncaughtException     │ ← erreurs sync
└───────────────────────┘

┌───────────────────────┐
│ warning               │ ← warning système
└───────────────────────┘
