import { db } from "..";
import { users } from "../schema";

async function main() {
	await db.insert(users).values({
		firstName: "Hello",
		lastName: "World"
	});
}

main();
