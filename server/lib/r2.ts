import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _r2: S3Client | null = null;

function getR2(): S3Client {
	if (!_r2) {
		_r2 = new S3Client({
			region: "auto",
			endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
				secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
			},
		});
	}
	return _r2;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: process.env.R2_BUCKET_NAME ?? "eva-licious",
		Key: key,
	});
	return getSignedUrl(getR2(), command, { expiresIn });
}
