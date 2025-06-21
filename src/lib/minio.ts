import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { PutObjectCommandOutput } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: "us-east-1", // This is required but not used by MinIO
	endpoint: process.env.MINIO_API_URL as string,
	credentials: {
		accessKeyId: process.env.MINIO_ADMIN_USER as string,
		secretAccessKey: process.env.MINIO_ADMIN_PASSWORD as string
	},
	forcePathStyle: true // Required for MinIO
});

export const uploadFile = async (filename: string, file: File): Promise<PutObjectCommandOutput> => {
	try {
		// Convert the File object to a Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const command = new PutObjectCommand({
			Bucket: process.env.MINIO_BUCKET_NAME as string,
			Key: filename,
			Body: buffer,
			ContentType: file.type
		});

		const response = await s3Client.send(command);
		return response;
	} catch (error) {
		console.error("Error uploading file:", error);
		// Optionally log the error object for debugging
		console.error("Error details:", error);
		throw new Error("Failed to upload file to MinIO.");
	}
};
