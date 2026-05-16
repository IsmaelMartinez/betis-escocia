# ADR-012: Core Libraries

## Status

Accepted

## Libraries Chosen

### Date Handling: date-fns

- **Why**: Modular, tree-shakeable, immutable, TypeScript support
- **Usage**: Import only needed functions
- **Rejected**: Moment.js (large), Luxon (heavier than needed)

```typescript
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

format(date, "dd MMM yyyy", { locale: es });
```

### Validation: Zod

- **Why**: TypeScript-first, excellent inference, composable schemas
- **Usage**: API route query validation via `createApiHandler`

```typescript
import { z } from "zod";
const matchesQuerySchema = z.object({
  type: z
    .enum(["all", "upcoming", "recent", "conference", "friendlies"])
    .default("all"),
  live: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
});
```
