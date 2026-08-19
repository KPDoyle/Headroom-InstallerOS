import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const installerWorkspaces = sqliteTable("installer_workspaces", {
  workspaceKey: text("workspace_key").primaryKey(),
  state: text("state").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
