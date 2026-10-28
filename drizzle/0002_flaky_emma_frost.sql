PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`machine` text NOT NULL,
	`coffee_id` integer NOT NULL,
	`drink` text NOT NULL,
	`stars` real NOT NULL,
	`intensity` integer,
	`bitterness` integer,
	`acidity` integer,
	`body` integer,
	`notes` text,
	`again` integer,
	`sugar` integer,
	`comment` text,
	`name` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`coffee_id`) REFERENCES `coffees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ratings`("id", "machine", "coffee_id", "drink", "stars", "intensity", "bitterness", "acidity", "body", "notes", "again", "sugar", "comment", "name", "created_at") SELECT "id", "machine", "coffee_id", "drink", "stars", "intensity", "bitterness", "acidity", "body", "notes", "again", "sugar", "comment", "name", "created_at" FROM `ratings`;--> statement-breakpoint
DROP TABLE `ratings`;--> statement-breakpoint
ALTER TABLE `__new_ratings` RENAME TO `ratings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;