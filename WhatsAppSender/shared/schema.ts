import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  plan: text("plan").default("free"),
  messagesLimit: integer("messages_limit").default(100),
  messagesUsed: integer("messages_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name"),
  phone: text("phone").notNull(),
  isValid: boolean("is_valid").default(true),
  groups: text("groups").array(),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  status: text("status").default("draft"), // draft, scheduled, sending, completed, failed
  scheduledAt: timestamp("scheduled_at"),
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  failedCount: integer("failed_count").default(0),
  readCount: integer("read_count").default(0),
  attachments: json("attachments"),
  personalization: boolean("personalization").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  contactId: integer("contact_id").notNull(),
  userId: integer("user_id").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, sent, delivered, read, failed
  error: text("error"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  inviteLink: text("invite_link"),
  memberCount: integer("member_count").default(0),
  category: text("category"),
  isPublic: boolean("is_public").default(false),
  extractedAt: timestamp("extracted_at").defaultNow(),
});

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionName: text("session_name").notNull(),
  isConnected: boolean("is_connected").default(false),
  qrCode: text("qr_code"),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // campaign_sent, contacts_imported, group_extracted, etc
  title: text("title").notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  deliveredAt: true,
  readAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  extractedAt: true,
});

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessions).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type WhatsappSession = typeof whatsappSessions.$inferSelect;
export type InsertWhatsappSession = z.infer<typeof insertWhatsappSessionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
