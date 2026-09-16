import {
  pgTable, pgEnum, serial, integer, text, timestamp, boolean, unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const showStatus = pgEnum("show_status", ["setup", "live", "audience", "complete"]);
export const contestantStatus = pgEnum("contestant_status", ["waiting", "voting", "revealed"]);
export const voteValue = pgEnum("vote_value", ["neutral", "red", "yellow"]);

export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  showDate: timestamp("show_date", { withTimezone: true }),
  status: showStatus("status").notNull().default("setup"),
  currentContestantId: integer("current_contestant_id")
    .references((): AnyPgColumn => contestants.id, { onDelete: "set null" }),
  audienceBonusConfirmed: boolean("audience_bonus_confirmed").notNull().default(false),
  winnerContestantId: integer("winner_contestant_id")
    .references((): AnyPgColumn => contestants.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const judges = pgTable("judges", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.showId, t.slug)]);

export const contestants = pgTable("contestants", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  startupName: text("startup_name").notNull(),
  founderName: text("founder_name"),
  position: integer("position").notNull(),
  status: contestantStatus("status").notNull().default("waiting"),
  audienceBonusPoints: integer("audience_bonus_points").notNull().default(0),
}, (t) => [unique().on(t.showId, t.position)]);

export const judgeVotes = pgTable("judge_votes", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  judgeId: integer("judge_id").notNull().references(() => judges.id, { onDelete: "cascade" }),
  contestantId: integer("contestant_id").notNull().references(() => contestants.id, { onDelete: "cascade" }),
  value: voteValue("value").notNull().default("neutral"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.judgeId, t.contestantId)]);
