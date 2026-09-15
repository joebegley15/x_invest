import {
  pgTable, pgEnum, serial, integer, text, timestamp, unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const showStatus = pgEnum("show_status", ["setup", "live", "audience", "complete"]);
export const contestantStatus = pgEnum("contestant_status", ["waiting", "voting", "revealed"]);
export const voteValue = pgEnum("vote_value", ["green", "red"]);
export const roundKind = pgEnum("round_kind", ["audience_favorite", "overall_runoff"]);

export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  showDate: timestamp("show_date", { withTimezone: true }),
  status: showStatus("status").notNull().default("setup"),
  audienceBonusPoints: integer("audience_bonus_points").notNull().default(2),
  currentContestantId: integer("current_contestant_id")
    .references((): AnyPgColumn => contestants.id, { onDelete: "set null" }),
  audienceBonusContestantId: integer("audience_bonus_contestant_id")
    .references((): AnyPgColumn => contestants.id, { onDelete: "set null" }),
  winnerContestantId: integer("winner_contestant_id")
    .references((): AnyPgColumn => contestants.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const judges = pgTable("judges", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(), // stored lowercase for login matching
  accessToken: text("access_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.showId, t.lastName)]);

export const contestants = pgTable("contestants", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  startupName: text("startup_name").notNull(),
  founderName: text("founder_name"),
  position: integer("position").notNull(),
  status: contestantStatus("status").notNull().default("waiting"),
}, (t) => [unique().on(t.showId, t.position)]);

export const judgeVotes = pgTable("judge_votes", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  judgeId: integer("judge_id").notNull().references(() => judges.id, { onDelete: "cascade" }),
  contestantId: integer("contestant_id").notNull().references(() => contestants.id, { onDelete: "cascade" }),
  value: voteValue("value").notNull(),
  lockedAt: timestamp("locked_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.judgeId, t.contestantId)]);

export const audienceRounds = pgTable("audience_rounds", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  kind: roundKind("kind").notNull(),
  roundNumber: integer("round_number").notNull(), // 1 = main vote, 2+ = runoffs
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.showId, t.kind, t.roundNumber)]);

export const audienceTallies = pgTable("audience_tallies", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull().references(() => audienceRounds.id, { onDelete: "cascade" }),
  contestantId: integer("contestant_id").notNull().references(() => contestants.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  counter: integer("counter").notNull(), // 1 or 2
  votes: integer("votes").notNull(),
}, (t) => [unique().on(t.roundId, t.contestantId, t.section, t.counter)]);

export const judgeTiebreakVotes = pgTable("judge_tiebreak_votes", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  kind: roundKind("kind").notNull(),
  judgeId: integer("judge_id").notNull().references(() => judges.id, { onDelete: "cascade" }),
  contestantId: integer("contestant_id").notNull().references(() => contestants.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.showId, t.kind, t.judgeId)]);