# Player Management API Documentation

Comprehensive player and squad management system with Football-Data.org sync integration, formation builder, and player deduplication.

## Overview

The player management system provides:
- **Squad Tracking**: Current Real Betis squad with positions, shirt numbers, and metadata
- **Formation Builder**: Create and save starting eleven formations with visual pitch positions
- **Player Operations**: Alias management, display names, search/filtering
- **Sync Integration**: Automated sync from Football-Data.org API
- **Deduplication**: Merge duplicate player records while preserving history

## Database Schema

### squad_members Table

Canonical source for current squad with rich metadata.

```sql
CREATE TABLE squad_members (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    external_id INTEGER,                    -- Football-Data.org player ID
    shirt_number INTEGER CHECK (shirt_number BETWEEN 1 AND 99),
    position VARCHAR(30),                   -- Full position name
    position_short VARCHAR(3),              -- GK, CB, LB, RB, DM, CM, AM, LW, RW, ST
    date_of_birth DATE,
    nationality VARCHAR(100),
    photo_url TEXT,
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    squad_status VARCHAR(20) DEFAULT 'active',  -- active, injured, suspended, loaned_out, on_loan
    joined_at TIMESTAMPTZ,
    contract_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id)
);
```

### starting_elevens Table

Saved formations with JSONB lineup data.

```sql
CREATE TABLE starting_elevens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    formation VARCHAR(10) NOT NULL,         -- "4-3-3", "4-4-2", etc.
    lineup JSONB NOT NULL DEFAULT '[]',     -- Array of {playerId, squadMemberId, position, x, y}
    match_id BIGINT REFERENCES matches(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_predicted BOOLEAN DEFAULT FALSE,
    created_by TEXT,                        -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### players Table Enhancements

```sql
ALTER TABLE players
    ADD COLUMN display_name VARCHAR(100),
    ADD COLUMN external_id INTEGER;

CREATE INDEX idx_players_external_id ON players(external_id);
```

## API Endpoints

All endpoints require admin authentication via Clerk.

### Squad Management

#### List Squad Members

```http
GET /api/admin/squad
```

**Response:**
```json
{
  "success": true,
  "squadMembers": [
    {
      "id": 1,
      "player_id": 123,
      "external_id": 45678,
      "shirt_number": 10,
      "position": "Attacking Midfield",
      "position_short": "AM",
      "date_of_birth": "1992-04-21",
      "nationality": "Spain",
      "is_captain": false,
      "squad_status": "active",
      "player": {
        "id": 123,
        "name": "Francisco Roman Alarcon",
        "normalized_name": "francisco roman alarcon",
        "display_name": "Isco",
        "aliases": ["isco"],
        "rumor_count": 42
      }
    }
  ]
}
```

#### Add Player to Squad

```http
POST /api/admin/squad
Content-Type: application/json

{
  "playerId": 123,
  "shirtNumber": 10,
  "position": "Attacking Midfield",
  "squadStatus": "active",
  "isCaptain": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Jugador añadido a la plantilla correctamente",
  "squadMember": { /* created squad member */ }
}
```

#### Get Squad Member

```http
GET /api/admin/squad/[id]
```

#### Update Squad Member

```http
PATCH /api/admin/squad/[id]
Content-Type: application/json

{
  "shirtNumber": 22,
  "squadStatus": "injured",
  "isCaptain": true
}
```

**Auto-calculation**: Updating `position` automatically calculates `position_short`.

#### Remove from Squad

```http
DELETE /api/admin/squad/[id]
```

Updates `players.is_current_squad` to `false` and deletes squad member record.

#### Sync Squad from Football-Data.org

```http
POST /api/admin/squad/sync
```

**Process:**
1. Fetches Real Betis squad from Football-Data.org API
2. Matches players by normalized name or aliases
3. Batch updates existing players and squad members
4. Creates new players and squad members
5. Marks departed players as "loaned_out"

**Response:**
```json
{
  "success": true,
  "message": "Sincronización completada: 3 creados, 22 actualizados, 1 marcados como inactivos",
  "result": {
    "squadSize": 26,
    "created": 3,
    "updated": 22,
    "removed": 1,
    "errors": 0
  }
}
```

**Performance**: Uses batch operations with `Promise.all()` to prevent N+1 queries.

### Formation Management

#### List Formations

```http
GET /api/admin/formations
```

**Response:**
```json
{
  "success": true,
  "formations": [
    {
      "id": 1,
      "name": "vs Athletic - Copa del Rey",
      "formation": "4-3-3",
      "lineup": [
        {
          "playerId": 123,
          "squadMemberId": 1,
          "position": "GK",
          "x": 50,
          "y": 10
        }
        // ... 10 more players
      ],
      "match_id": null,
      "is_active": true,
      "is_predicted": false,
      "created_at": "2025-01-04T12:00:00Z"
    }
  ]
}
```

#### Create Formation

```http
POST /api/admin/formations
Content-Type: application/json

{
  "name": "4-3-3 vs Sevilla",
  "formation": "4-3-3",
  "lineup": [
    {"playerId": 1, "squadMemberId": 1, "position": "GK", "x": 50, "y": 10},
    {"playerId": 2, "squadMemberId": 2, "position": "CB", "x": 35, "y": 25},
    // ... must have exactly 11 players
  ],
  "isActive": true,
  "isPredicted": false
}
```

**Validation**:
- Lineup must contain exactly 11 players
- Each player requires: playerId, squadMemberId, position, x (0-100), y (0-100)

#### Update Formation

```http
PATCH /api/admin/formations/[id]
Content-Type: application/json

{
  "name": "Updated name",
  "isActive": false
}
```

#### Delete Formation

```http
DELETE /api/admin/formations/[id]
```

### Player Operations

#### List Players with Filters

```http
GET /api/admin/players?search=isco&currentSquadOnly=true&page=1&limit=20
```

**Query Parameters:**
- `search`: Search by name, normalized_name, or display_name (ILIKE with escaping)
- `currentSquadOnly`: Filter to current squad members only
- `withRumorsOnly`: Filter to players with rumor_count > 0
- `page`: Page number (max 1000)
- `limit`: Items per page (max 100)

**Response:**
```json
{
  "success": true,
  "players": [
    {
      "id": 123,
      "name": "Francisco Roman Alarcon",
      "normalized_name": "francisco roman alarcon",
      "display_name": "Isco",
      "aliases": ["isco"],
      "is_current_squad": true,
      "rumor_count": 42,
      "known_position": "Attacking Midfield",
      "known_club": "Real Betis"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Security**: ILIKE patterns are escaped to prevent SQL injection.

#### Get Player with Aliases

```http
GET /api/admin/players/[id]/aliases
```

**Response:**
```json
{
  "success": true,
  "player": {
    "id": 123,
    "name": "Francisco Roman Alarcon",
    "display_name": "Isco",
    "aliases": ["isco", "francisco alarcon"]
  }
}
```

#### Update Player Aliases

```http
PATCH /api/admin/players/[id]/aliases
Content-Type: application/json

{
  "aliases": ["isco", "francisco alarcon", "paquito"],
  "displayName": "Isco"
}
```

**Process:**
- Normalizes all aliases
- Removes duplicates
- Prevents circular references (alias = normalized_name)
- Logs operation for audit trail

#### Add Single Alias

```http
POST /api/admin/players/[id]/aliases
Content-Type: application/json

{
  "alias": "paquito"
}
```

**Duplicate checking**: Returns error if alias already exists.

#### Remove Alias

```http
DELETE /api/admin/players/[id]/aliases
Content-Type: application/json

{
  "alias": "paquito"
}
```

#### Merge Duplicate Players

```http
POST /api/admin/soylenti/players/merge
Content-Type: application/json

{
  "primaryId": 123,
  "duplicateId": 456
}
```

**Process:**
1. Transfers all `betis_news` records from duplicate to primary
2. Adds duplicate's normalized name as alias to primary
3. Cascade deletes duplicate player (including squad_member if exists)
4. Preserves all mention history

**Response:**
```json
{
  "success": true,
  "message": "Jugadores fusionados correctamente",
  "newsTransferred": 15
}
```

## Data Types

### Position Enum

Full position names:
```typescript
type Position =
  | "Goalkeeper"
  | "Centre-Back"
  | "Left-Back"
  | "Right-Back"
  | "Defensive Midfield"
  | "Central Midfield"
  | "Attacking Midfield"
  | "Left Winger"
  | "Right Winger"
  | "Centre-Forward";
```

Short codes:
```typescript
type PositionShort = "GK" | "CB" | "LB" | "RB" | "DM" | "CM" | "AM" | "LW" | "RW" | "ST";
```

### Squad Status

```typescript
type SquadStatus = "active" | "injured" | "suspended" | "loaned_out" | "on_loan";
```

### Formation Patterns

Supported formations:
```typescript
type Formation = "4-3-3" | "4-4-2" | "4-2-3-1" | "3-5-2" | "3-4-3" | "5-3-2" | "4-1-4-1" | "4-5-1";
```

### Lineup Player

JSONB structure for starting eleven positions:
```typescript
interface LineupPlayer {
  playerId: number;        // Reference to players table
  squadMemberId: number;   // Reference to squad_members table
  position: PositionShort; // GK, CB, etc.
  x: number;              // Horizontal position (0-100 percentage)
  y: number;              // Vertical position (0-100 percentage)
}
```

## Error Handling

### Common Error Codes

- `400`: Validation error (invalid input, missing required fields)
- `401`: Unauthorized (missing or invalid admin token)
- `404`: Resource not found
- `409`: Conflict (duplicate constraint violation)
- `500`: Server error

### Example Error Response

```json
{
  "success": false,
  "error": "El jugador ya está en la plantilla"
}
```

### Duplicate Handling

Squad member with same `player_id`:
```json
{
  "success": false,
  "error": "El jugador ya está en la plantilla"
}
```

Unique constraint violation (code 23505) is automatically detected and handled.

## Performance Considerations

### Batch Operations

All sync operations use batching to prevent N+1 queries:

```typescript
// Collect data in first pass
const playersToUpdate = [];
const playersToCreate = [];

// Execute batch operations
await Promise.all(playersToUpdate.map(p => supabase.update(...)));
await supabase.insert(playersToCreate);
```

### Indexes

Optimized queries via indexes on:
- `squad_members.position`
- `squad_members.squad_status`
- `squad_members.shirt_number`
- `squad_members.external_id`
- `starting_elevens.lineup` (GIN index for JSONB)
- `players.external_id`

### Pagination Bounds

Enforced limits to prevent abuse:
- Max 100 items per page
- Max page number 1000
- Total query limit: 100,000 records

## Security

### Authentication

All endpoints require Clerk admin authentication:
```typescript
createApiHandler({
  auth: 'admin',
  handler: async (data, { supabase, user }) => {
    // user contains Clerk user data
    // supabase is authenticated client
  }
})
```

### RLS Policies

- **squad_members**: Public read (SELECT) + Service role full access
- **starting_elevens**: Public read (SELECT) + Service role full access
- **players**: Existing policies maintained

### Input Validation

- Zod schemas validate all inputs
- ILIKE patterns escaped for SQL injection prevention
- Position values validated against enum
- Pagination bounds enforced

## Usage Examples

### Complete Squad Sync Workflow

```bash
# 1. Sync squad from Football-Data.org
curl -X POST https://api.example.com/api/admin/squad/sync \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. List synced squad members
curl https://api.example.com/api/admin/squad \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Update a player's position
curl -X PATCH https://api.example.com/api/admin/squad/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Central Midfield", "shirtNumber": 8}'
```

### Create Formation

```bash
# 1. Get available squad members
curl https://api.example.com/api/admin/squad \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Create 4-3-3 formation
curl -X POST https://api.example.com/api/admin/formations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "4-3-3 vs Sevilla",
    "formation": "4-3-3",
    "lineup": [
      {"playerId": 1, "squadMemberId": 1, "position": "GK", "x": 50, "y": 10},
      {"playerId": 2, "squadMemberId": 2, "position": "CB", "x": 35, "y": 25},
      {"playerId": 3, "squadMemberId": 3, "position": "CB", "x": 65, "y": 25},
      {"playerId": 4, "squadMemberId": 4, "position": "LB", "x": 15, "y": 30},
      {"playerId": 5, "squadMemberId": 5, "position": "RB", "x": 85, "y": 30},
      {"playerId": 6, "squadMemberId": 6, "position": "CM", "x": 35, "y": 50},
      {"playerId": 7, "squadMemberId": 7, "position": "CM", "x": 50, "y": 55},
      {"playerId": 8, "squadMemberId": 8, "position": "CM", "x": 65, "y": 50},
      {"playerId": 9, "squadMemberId": 9, "position": "LW", "x": 20, "y": 75},
      {"playerId": 10, "squadMemberId": 10, "position": "RW", "x": 80, "y": 75},
      {"playerId": 11, "squadMemberId": 11, "position": "ST", "x": 50, "y": 85}
    ]
  }'
```

### Player Alias Management

```bash
# 1. Search for player
curl "https://api.example.com/api/admin/players?search=francisco" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Get player aliases
curl https://api.example.com/api/admin/players/123/aliases \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Update aliases and display name
curl -X PATCH https://api.example.com/api/admin/players/123/aliases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aliases": ["isco", "francisco alarcon", "paquito"],
    "displayName": "Isco"
  }'
```

### Merge Duplicate Players

```bash
# 1. Search for duplicates
curl "https://api.example.com/api/admin/players?search=isco" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Merge duplicate into primary
curl -X POST https://api.example.com/api/admin/soylenti/players/merge \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primaryId": 123, "duplicateId": 456}'
```

## References

- [ADR-018: Player & Squad Management](../adr/018-player-squad-management.md)
- [Football-Data.org API](./football-data-api-implementation.md)
- [Database Migrations](../adr/014-database-migrations.md)
