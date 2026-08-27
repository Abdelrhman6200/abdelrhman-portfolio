CREATE TABLE `feedbackComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackId` int NOT NULL,
	`authorId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbackComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedbackEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`sessionId` int NOT NULL,
	`teacherId` int NOT NULL,
	`strengths` text NOT NULL,
	`areasForImprovement` text NOT NULL,
	`nextSteps` text NOT NULL,
	`status` enum('draft','pending review','approved') NOT NULL DEFAULT 'draft',
	`coordinatorId` int,
	`coordinatorComment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbackEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`teacherId` int NOT NULL,
	`sessionDate` timestamp NOT NULL,
	`sessionNumber` int NOT NULL,
	`durationMinutes` int NOT NULL,
	`topic` varchar(240) NOT NULL,
	`objectives` text,
	`sessionNotes` text,
	`observations` text,
	`artifacts` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`className` varchar(120) NOT NULL,
	`programme` varchar(160) NOT NULL,
	`level` varchar(80),
	`learningGoals` text,
	`activeStatus` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
UPDATE `users` SET `role` = 'teacher' WHERE `role` IN ('user', 'admin');
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('teacher','coordinator') NOT NULL DEFAULT 'teacher';
