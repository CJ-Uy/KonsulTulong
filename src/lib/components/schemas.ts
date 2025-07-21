import { z } from "zod/v4";

export const schema = z.object({
	caseNum: z.string(),
	name: z.string(),
	surgicalService: z.string(),
	status: z.string(),
	age: z.number(),
	sex: z.string(),
	contact: z.string(),
	waitingTime: z.string(),
});

export type Schema = z.infer<typeof schema>;
