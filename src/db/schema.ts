import { pgTable, primaryKey, foreignKey, text, timestamp, jsonb, date, bigint, smallint, boolean, pgEnum } from "drizzle-orm/pg-core"

export const wordStatus = pgEnum("word_status", ['NONE', 'TO_LEARN', 'LEARNED', 'HIDDEN'])

export const wordTable = pgTable("word", {
	word: text().notNull(),
	user: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	raw: jsonb().notNull(),
	status: wordStatus().default('NONE').notNull(),
	aiDefinition: jsonb("ai_definition"),
	aiDefinitionRequestStartDate: date("ai_definition_request_start_date"),
}, (table) => ({
	primaryKey: primaryKey({ columns: [table.word, table.user] }),
	userFkey: foreignKey({
		columns: [table.user],
		foreignColumns: [userTable.login],
		name: "word_user_fkey"
	}),
}));

export const trainingSpellingTable = pgTable("training_spelling", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity({ name: "training_spelling_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: "9223372036854775807", cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	word: text().notNull(),
	answer: text().notNull(),
	errorsCount: smallint("errors_count").notNull(),
	user: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.user],
			foreignColumns: [userTable.login],
			name: "training_spelling_user_fkey"
		}),
	foreignKey({
		columns: [table.word, table.user],
		foreignColumns: [wordTable.word, wordTable.user],
		name: "training_spelling_word_fkey"
	}),
]);

export const pronunciationTable = pgTable("pronunciation", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity({ name: "pronunciation_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: "9223372036854775807", cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	word: text().notNull(),
	recognisedText: text("recognised_text").notNull(),
	success: boolean().notNull(),
	user: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.user],
			foreignColumns: [userTable.login],
			name: "pronunciation_user_fkey"
		}),
	foreignKey({
		columns: [table.word, table.user],
		foreignColumns: [wordTable.word, wordTable.user],
		name: "pronunciation_word_fkey"
	}),
]);

export const trainingTable = pgTable("training", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity({ name: "training_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: "9223372036854775807", cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	word: text().notNull(),
	isSuccess: boolean("is_success").notNull(),
	definition: text().notNull(),
	user: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.user],
			foreignColumns: [userTable.login],
			name: "training_user_fkey"
		}),
	foreignKey({
		columns: [table.word, table.user],
		foreignColumns: [wordTable.word, wordTable.user],
		name: "training_word_fkey"
	}),
]);

export const userTable = pgTable("user", {
	login: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	passphrase: text().notNull(),
});
