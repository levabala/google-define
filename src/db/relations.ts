import { relations } from "drizzle-orm/relations";
import { userTable, wordTable, trainingSpellingTable, pronunciationTable, trainingTable } from "./schema";

export const wordRelations = relations(wordTable, ({one, many}) => ({
	user: one(userTable, {
		fields: [wordTable.user],
		references: [userTable.login]
	}),
	trainingSpellings: many(trainingSpellingTable),
	pronunciations: many(pronunciationTable),
	trainings: many(trainingTable),
}));

export const userRelations = relations(userTable, ({many}) => ({
	words: many(wordTable),
	trainingSpellings: many(trainingSpellingTable),
	pronunciations: many(pronunciationTable),
	trainings: many(trainingTable),
}));

export const trainingSpellingRelations = relations(trainingSpellingTable, ({one}) => ({
	user: one(userTable, {
		fields: [trainingSpellingTable.user],
		references: [userTable.login]
	}),
	word: one(wordTable, {
		fields: [trainingSpellingTable.word],
		references: [wordTable.word]
	}),
}));

export const pronunciationRelations = relations(pronunciationTable, ({one}) => ({
	user: one(userTable, {
		fields: [pronunciationTable.user],
		references: [userTable.login]
	}),
	word: one(wordTable, {
		fields: [pronunciationTable.word],
		references: [wordTable.word]
	}),
}));

export const trainingRelations = relations(trainingTable, ({one}) => ({
	user: one(userTable, {
		fields: [trainingTable.user],
		references: [userTable.login]
	}),
	word: one(wordTable, {
		fields: [trainingTable.word],
		references: [wordTable.word]
	}),
}));
