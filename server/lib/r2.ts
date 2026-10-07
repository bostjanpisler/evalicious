import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-compatible file storage (Railway bucket in production). Product file keys
// are still called `r2FileKey` in Sanity and the database.
let _storage: S3Client | null = null;

function getStorage(): S3Client {
	if (!_storage) {
		const endpoint = process.env.STORAGE_ENDPOINT;
		const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
		const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
		if (!endpoint || !accessKeyId || !secretAccessKey) {
			throw new Error("Delivery storage is not configured");
		}
		_storage = new S3Client({
			region: process.env.STORAGE_REGION ?? "auto",
			endpoint,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});
	}
	return _storage;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
	const bucket = process.env.STORAGE_BUCKET;
	if (!bucket) throw new Error("STORAGE_BUCKET is not configured");
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});
	return getSignedUrl(getStorage(), command, { expiresIn });
}
