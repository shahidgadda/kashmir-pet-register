import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const vetOfficers = pgTable("vet_officers", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  dispensary: varchar("dispensary", { length: 100 }).notNull(),
  block: varchar("block", { length: 100 }).notNull(),
  officerName: varchar("officer_name", { length: 255 }),
  isActive: varchar("is_active", { length: 10 }).notNull().default('true'),
});

export const insertVetOfficerSchema = createInsertSchema(vetOfficers).omit({
  id: true,
});

export type InsertVetOfficer = z.infer<typeof insertVetOfficerSchema>;
export type VetOfficer = typeof vetOfficers.$inferSelect;

export const petRegistrations = pgTable('pet_registrations', {
  id: serial('id').primaryKey(),
  registrationNumber: varchar('registration_number', { length: 100 }),
  registrationDate: varchar('registration_date', { length: 10 }),
  
  ownerName: varchar('owner_name', { length: 255 }).notNull(),
  ownerAddress: text('owner_address').notNull(),
  mobile: varchar('mobile', { length: 10 }).notNull(),
  email: varchar('email', { length: 255 }),
  district: varchar('district', { length: 50 }).notNull().default('Kupwara'),
  block: varchar('block', { length: 100 }).notNull(),
  dispensary: varchar('dispensary', { length: 100 }).notNull(),
  
  species: varchar('species', { length: 10 }).notNull(),
  breed: varchar('breed', { length: 100 }).notNull(),
  petName: varchar('pet_name', { length: 100 }),
  sex: varchar('sex', { length: 10 }).notNull(),
  age: varchar('age', { length: 50 }).notNull(),
  color: varchar('color', { length: 100 }).notNull(),
  markOfIdentification: text('mark_of_identification'),
  
  vaccinationStatus: varchar('vaccination_status', { length: 20 }).notNull(),
  vaccinationDate: varchar('vaccination_date', { length: 10 }),
  microchipNumber: varchar('microchip_number', { length: 100 }),
  photoUrl: text('photo_url'),
  otherDetails: text('other_details'),
  
  status: varchar('status', { length: 50 }).notNull().default('pending_vet_review'),
  submittedBy: varchar('submitted_by', { length: 20 }).notNull().default('owner'),
  vetRemarks: text('vet_remarks'),
  authorityRemarks: text('authority_remarks'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertPetRegistrationSchema = createInsertSchema(petRegistrations).omit({
  id: true,
  registrationNumber: true,
  registrationDate: true,
  createdAt: true,
});

export type InsertPetRegistration = z.infer<typeof insertPetRegistrationSchema>;
export type PetRegistration = typeof petRegistrations.$inferSelect;
