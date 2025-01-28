import type { User as DBUser } from "@db/schema";

// Extend the database User type with additional properties
export interface User extends DBUser {
  isAdmin: boolean;
  isFreelancer: boolean;
}

// Re-export other types from schema
export type { Client, Hours } from "@db/schema";
