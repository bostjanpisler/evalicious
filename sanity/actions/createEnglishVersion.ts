import { useState } from "react";
import { type DocumentActionComponent, useClient } from "sanity";
import { useRouter } from "sanity/router";

const API_VERSION = "2024-01-01";

/**
 * "Create English version": copies a Slovenian document into a new, unpublished
 * English draft linked through `translationOf`, then opens it for translating.
 * If an English version already exists it just opens that one.
 */
export const createEnglishVersion: DocumentActionComponent = (props) => {
	const client = useClient({ apiVersion: API_VERSION });
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const source = props.draft ?? props.published;

	if (!source || ((source.language as string | undefined) ?? "sl") !== "sl") return null;

	return {
		label: busy ? "Creating…" : "Create English version",
		disabled: busy,
		onHandle: async () => {
			setBusy(true);
			try {
				const existing = await client.fetch<string | null>(
					`*[_type == $type && translationOf._ref == $id && !(_id in path("drafts.**"))][0]._id`,
					{ type: props.type, id: props.id },
				);
				const draftExisting = existing
					? null
					: await client.fetch<string | null>(
							`*[_type == $type && translationOf._ref == $id][0]._id`,
							{ type: props.type, id: props.id },
						);
				const found = existing ?? draftExisting;
				if (found) {
					router.navigateIntent("edit", { id: found.replace(/^drafts\./, ""), type: props.type });
					return;
				}

				const { _id, _rev, _createdAt, _updatedAt, slug, ...rest } = source as Record<
					string,
					unknown
				>;
				const created = await client.create({
					...rest,
					_type: props.type,
					_id: `drafts.${crypto.randomUUID()}`,
					language: "en",
					translationOf: { _type: "reference", _ref: props.id },
					published: false,
				});
				router.navigateIntent("edit", {
					id: created._id.replace(/^drafts\./, ""),
					type: props.type,
				});
			} finally {
				setBusy(false);
				props.onComplete();
			}
		},
	};
};
