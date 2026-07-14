import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _r2: S3Client | null = null;

function getR2(): S3Client {
	if (!_r2) {
		const accountId = process.env.R2_ACCOUNT_ID;
		const accessKeyId = process.env.R2_ACCESS_KEY_ID;
		const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
		if (!accountId || !accessKeyId || !secretAccessKey) {
			throw new Error("R2 delivery storage is not configured");
		}
		_r2 = new S3Client({
			region: "auto",
			endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});
	}
	return _r2;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
	const bucket = process.env.R2_BUCKET_NAME;
	if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});
	return getSignedUrl(getR2(), command, { expiresIn });
}
