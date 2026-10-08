import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
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

export async function storedObjectSize(key: string): Promise<number | null> {
	try {
		const head = await getStorage().send(
			new HeadObjectCommand({ Bucket: process.env.STORAGE_BUCKET, Key: key }),
		);
		return head.ContentLength ?? null;
	} catch (error) {
		if ((error as { name?: string }).name === "NotFound") return null;
		throw error;
	}
}

export async function storeObject(
	key: string,
	body: Uint8Array,
	contentType: string,
): Promise<void> {
	await getStorage().send(
		new PutObjectCommand({
			Bucket: process.env.STORAGE_BUCKET,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function listStoredKeys(prefix: string): Promise<string[]> {
	const keys: string[] = [];
	let token: string | undefined;
	do {
		const page = await getStorage().send(
			new ListObjectsV2Command({
				Bucket: process.env.STORAGE_BUCKET,
				Prefix: prefix,
				ContinuationToken: token,
			}),
		);
		for (const object of page.Contents ?? []) if (object.Key) keys.push(object.Key);
		token = page.IsTruncated ? page.NextContinuationToken : undefined;
	} while (token);
	return keys;
}

export async function deleteStoredKey(key: string): Promise<void> {
	await getStorage().send(
		new DeleteObjectCommand({ Bucket: process.env.STORAGE_BUCKET, Key: key }),
	);
}
