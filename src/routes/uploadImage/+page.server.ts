import { uploadFile } from "$lib/minio";

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			const file = formData.get("file");

			// Validate the file
			if (!file || !(file instanceof File)) {
				return { status: 400, body: "No file uploaded or file is invalid." };
			}

			// Generate a unique filename
			const filename = file.name;

			// Upload the file
			const result = await uploadFile(filename, file);
			return { status: 200, body: { success: true, result } };
		} catch (error) {
			console.error("Error uploading file:", error);
			return { status: 500, body: "Failed to upload file." };
		}
	}
};
