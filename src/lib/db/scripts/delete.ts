import { db } from ".."; 
import * as schema from "../schema";

async function countdown(seconds: number) {
	for (let i = seconds; i > 0; i--) {
		console.log(`Deleting all data in ${i} seconds...`);
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	console.log("Countdown finished. Initiating deletion...");
}

async function deleteAllData() {
	console.log("!!! WARNING: THIS SCRIPT WILL DELETE ALL DATA FROM YOUR DATABASE !!!");
	console.log("Please ensure you have a backup if needed.");

	await countdown(5); // Start 5-second countdown

	try {
		// Drizzle doesn't have a direct "truncate all tables" function.
		// We'll delete data from tables in an order that respects foreign key constraints.
		// Start with tables that have foreign keys pointing to others,
		// or tables that are less likely to have other tables pointing to them.

		console.log("Deleting data from 'responses' table...");
		await db.delete(schema.response);

		console.log("Deleting data from 'clinic' table...");
		await db.delete(schema.clinic);

		console.log("Deleting data from 'template' table...");
		await db.delete(schema.template);

		console.log("Deleting data from 'session' table...");
		await db.delete(schema.session);

		console.log("Deleting data from 'account' table...");
		await db.delete(schema.account);

		console.log("Deleting data from 'verification' table...");
		await db.delete(schema.verification);

		console.log("Deleting data from 'user' table...");
		await db.delete(schema.user);

		console.log("All data deleted successfully!");
	} catch (error) {
		console.error("Error deleting data:", error);
	} finally {
		// Close the database connection
		await db.$client.end();
		console.log("Database connection closed.");
	}
}

deleteAllData();
