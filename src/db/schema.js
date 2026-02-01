import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", ["scheduled","live","finished",]);
/**
 * MATCHES TABLE
 */
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  status: matchStatusEnum("status").notNull().default("scheduled"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * COMMENTARY TABLE
 *
 * Designed for:
 * - real-time inserts
 * - ordered playback
 * - filtering & enrichment
 */
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),

  // Match timeline
  minute: integer("minute"), // e.g. 45, 90+2
  sequence: integer("sequence").notNull(), // strict ordering within a match
  period: text("period"), // e.g. "1st_half", "2nd_half", "extra_time"

  // Event metadata
  eventType: text("event_type").notNull(), // goal, foul, substitution, etc.
  actor: text("actor"), // player or system
  team: text("team"), // home / away / team name

  message: text("message").notNull(),

  metadata: jsonb("metadata").$type({}), // extensible structured payload
  tags: text("tags").array(), // e.g. ['goal', 'var', 'penalty']

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
