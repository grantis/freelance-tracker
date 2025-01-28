import { 
  pgTable, 
  text, 
  serial, 
  timestamp, 
  integer,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  googleId: text("google_id").unique().notNull(),
  isFreelancer: boolean("is_freelancer").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  freelancerId: integer("freelancer_id").notNull().references(() => users.id),
  userId: integer("user_id").references(() => users.id),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const hours = pgTable("hours", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 4, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  clientsAsFreelancer: many(clients, { relationName: "freelancer" }),
  clientsAsClient: many(clients, { relationName: "client" })
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  freelancer: one(users, {
    fields: [clients.freelancerId],
    references: [users.id],
    relationName: "freelancer"
  }),
  client: one(users, {
    fields: [clients.userId],
    references: [users.id],
    relationName: "client"
  }),
  hours: many(hours)
}));

export const hoursRelations = relations(hours, ({ one }) => ({
  client: one(clients, {
    fields: [hours.clientId],
    references: [clients.id]
  })
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertClientSchema = createInsertSchema(clients);
export const selectClientSchema = createSelectSchema(clients);
export const insertHoursSchema = createInsertSchema(hours);
export const selectHoursSchema = createSelectSchema(hours);

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Hours = typeof hours.$inferSelect;