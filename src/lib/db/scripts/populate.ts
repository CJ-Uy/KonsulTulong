import { db } from "..";
import { user, clinic, template } from "../schema";
import { faker } from "@faker-js/faker";
import { signUp } from "../../auth-client";
import { eq } from "drizzle-orm";
import sampleQuestions from "./sampleTemplateQuestions.json";

async function main() {
	console.log("Starting population script...");

	// Create a template
	const newTemplate = await db.insert(template).values({
		name: "Basic Questions",
		description: "A set of sample generic questions",
		questions: sampleQuestions
    });
    console.log("Created basic questions template")

	// Create a clinic
	const newClinic = await db.insert(clinic).values({
		clinicCode: "18B0CS",
		activeTemplateId: newTemplate.id
	});
    console.log("Created a Clinic w/ code: 18B0CS");

	// Create a doctor
	let firstName = faker.person.firstName();
	let lastName = faker.person.lastName();
	let nickname = faker.internet.username({ firstName, lastName });
	const doctor = await signUp.email({
		email: faker.internet.email({ firstName, lastName }).toLowerCase(),
		name: nickname,
		password: "password"
	});
	await db
		.update(user)
		.set({ firstName, lastName, clinicId: newClinic.id })
		.where(eq(user.id, doctor.data?.user.id));
	console.log("Created Doctor's user and account");

	// Update the clinic's name to have the doctor's in it
	await db
		.update(clinic)
		.set({ clinicName: `Dr. ${firstName} ${lastName}'s Anesthesiology Clinic` });
	console.log("Updated the Clinic Name to use the doctor's");

	// Create a Secretary
	firstName = faker.person.firstName();
	lastName = faker.person.lastName();
	nickname = faker.internet.username({ firstName, lastName });
	const secretary = await signUp.email({
		email: faker.internet.email({ firstName, lastName }).toLowerCase(),
		name: nickname,
		password: "password"
	});
	await db
		.update(user)
		.set({ firstName, lastName, clinicId: newClinic.id })
		.where(eq(user.id, secretary.data?.user.id));
	console.log("Created secretary's user and account");

	// Close the connection with the database
	await db.$client.end();
	console.log("Closed Connection With Database");
}

main();
