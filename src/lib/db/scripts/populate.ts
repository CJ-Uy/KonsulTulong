import { db } from "..";
import { users } from "../schema";
import { faker } from "@faker-js/faker";

async function main() {

    console.log("Adding users...")
    for (let i = 0; i < 10; i++) {
        await db.insert(users).values({
            firstName: faker.person.firstName,
            lastName: faker.person.lastName
        });
    }
    console.log("Completed Adding Users");
    
    console.log("Adding Clinic");


	await db.$pool.end();
	console.log("Closed Connection With Database");
}

main();
