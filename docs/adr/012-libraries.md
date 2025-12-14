# ADR-012: Core Libraries

## Status
Accepted

## Libraries Chosen

### Date Handling: date-fns
- **Why**: Modular, tree-shakeable, immutable, TypeScript support
- **Usage**: Import only needed functions
- **Rejected**: Moment.js (large), Luxon (heavier than needed)

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

format(date, 'dd MMM yyyy', { locale: es });
```

### Toast Notifications: Sonner
- **Why**: Simple API, elegant design, lightweight, accessible
- **Usage**: `<Toaster />` in layout, `toast()` from anywhere
- **Rejected**: React Toastify (verbose), React Hot Toast (less polished)

```typescript
import { toast } from 'sonner';
toast.success('RSVP confirmado');
```

### Validation: Zod
- **Why**: TypeScript-first, excellent inference, composable schemas
- **Usage**: All API route validation
- **Pattern**: `createApiHandler` uses Zod schemas

```typescript
import { z } from 'zod';
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
});
```

