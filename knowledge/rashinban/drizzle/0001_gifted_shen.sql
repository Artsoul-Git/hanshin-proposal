CREATE TABLE `flowDiagrams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`matrixId` int NOT NULL,
	`sourceQuadrant` int,
	`title` varchar(200) NOT NULL,
	`steps` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flowDiagrams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fourQuadrantMatrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`mandalaChartId` int NOT NULL,
	`sourceItemId` int,
	`title` varchar(200) NOT NULL,
	`xAxisLabel` varchar(100) NOT NULL,
	`yAxisLabel` varchar(100) NOT NULL,
	`quadrants` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fourQuadrantMatrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hearingAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`questionId` int NOT NULL,
	`answer` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hearingAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hearingQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`question` text NOT NULL,
	`questionOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hearingQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mandalaCharts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`proposalId` int NOT NULL,
	`centerTheme` varchar(200) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mandalaCharts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mandalaItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mandalaChartId` int NOT NULL,
	`categoryIndex` int NOT NULL,
	`itemIndex` int NOT NULL,
	`text` varchar(200) NOT NULL,
	`description` text,
	`priority` int DEFAULT 0,
	`isCategory` boolean NOT NULL DEFAULT false,
	`isExpanded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mandalaItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mandalaProposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`categories` json NOT NULL,
	`reasoning` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mandalaProposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`background` text NOT NULL,
	`targetPeriod` varchar(100),
	`constraints` text,
	`status` enum('draft','hearing','proposal','generating','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
