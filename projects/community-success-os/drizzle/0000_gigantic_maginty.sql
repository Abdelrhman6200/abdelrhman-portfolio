CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`type` enum('top_performer','most_improved','consistent','community_contributor','challenge_leader','potential_ambassador','emerging_talent') NOT NULL,
	`source` varchar(200) NOT NULL,
	`evidence` json,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`taskType` varchar(100) NOT NULL,
	`model` varchar(120) NOT NULL,
	`inputSummary` varchar(1000) NOT NULL,
	`output` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`actorUserId` int,
	`action` varchar(160) NOT NULL,
	`objectType` varchar(120) NOT NULL,
	`objectId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businessReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`metrics` json NOT NULL,
	`narrative` text NOT NULL,
	`actions` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businessReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cohorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`status` enum('planned','active','completed') NOT NULL DEFAULT 'active',
	CONSTRAINT `cohorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`eventType` enum('post','comment','reaction','workshop','challenge','submission') NOT NULL,
	`source` varchar(80) NOT NULL DEFAULT 'internal',
	`summary` varchar(500) NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `communityEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentIdeas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`title` varchar(320) NOT NULL,
	`source` varchar(240) NOT NULL,
	`audience` varchar(160) NOT NULL,
	`theme` varchar(160) NOT NULL,
	`objective` varchar(500) NOT NULL,
	`evidence` json,
	`status` enum('backlog','approved','scheduled','published','archived') NOT NULL DEFAULT 'backlog',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentIdeas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataQualityIssues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`source` varchar(120) NOT NULL,
	`issueType` varchar(200) NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('open','resolved','ignored') NOT NULL DEFAULT 'open',
	`details` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dataQualityIssues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`programId` int NOT NULL,
	`cohortId` int,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','paused','completed','churned') NOT NULL DEFAULT 'active',
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`availability` json,
	CONSTRAINT `instructors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`type` enum('onboarding','renewal','disengagement','support','recognition','content_followup') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`ownerUserId` int,
	`reason` varchar(1000) NOT NULL,
	`nextAction` varchar(1000) NOT NULL,
	`status` enum('open','in_progress','waiting','completed','dismissed') NOT NULL DEFAULT 'open',
	`dueDate` timestamp,
	`outcome` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`lessonId` int NOT NULL,
	`eventType` enum('started','progressed','completed','revisited') NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `lessonEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`chapter` varchar(160),
	`orderIndex` int NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 0,
	`transcript` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'published',
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','manager','coordinator','content','mentor','viewer') NOT NULL DEFAULT 'manager',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizationMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`type` varchar(64) NOT NULL DEFAULT 'recorded',
	`durationWeeks` int NOT NULL DEFAULT 12,
	`renewalWindowDays` int NOT NULL DEFAULT 30,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renewalCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`renewalDate` timestamp NOT NULL,
	`state` enum('not_started','planned','contacted','renewed','churned','dismissed') NOT NULL DEFAULT 'not_started',
	`ownerUserId` int,
	`nextAction` varchar(500),
	`outcome` varchar(500),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `renewalCases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`cohortId` int,
	`instructorId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`capacity` int NOT NULL DEFAULT 20,
	`attendeeCount` int NOT NULL DEFAULT 0,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` varchar(1000),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentSignals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`type` enum('engagement_drop','renewal_opportunity','top_performer','community_contributor','onboarding_gap','data_quality') NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`periodLabel` varchar(64) NOT NULL,
	`explanation` varchar(500) NOT NULL,
	`evidence` json,
	`state` enum('open','snoozed','dismissed','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentSignals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`externalId` varchar(128),
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`locale` varchar(32) NOT NULL DEFAULT 'en',
	`lifecycleState` enum('prospect','new','onboarding','active','declining','at_risk','renewal_due','renewed','completed','churned') NOT NULL DEFAULT 'new',
	`engagementState` enum('healthy','watch','declining','unknown') NOT NULL DEFAULT 'unknown',
	`progressPercent` int NOT NULL DEFAULT 0,
	`lastLesson` varchar(240),
	`lastActivityAt` timestamp,
	`lastContactAt` timestamp,
	`source` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`plan` varchar(120) NOT NULL,
	`status` enum('active','past_due','cancelled','unknown') NOT NULL DEFAULT 'unknown',
	`startDate` timestamp,
	`renewalDate` timestamp,
	`metadata` json,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
