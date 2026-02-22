import { defineField, defineType } from "sanity";

export const youtube = defineType({
	name: "youtube",
	title: "YouTube Embed",
	type: "object",
	fields: [
		defineField({
			name: "videoId",
			title: "Video ID or URL",
			type: "string",
			description:
				"Paste the YouTube video ID (e.g. dQw4w9WgXcQ) or the full URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "title",
			title: "Title",
			type: "string",
		}),
	],
	preview: {
		select: { title: "title", videoId: "videoId" },
		prepare({ title, videoId }) {
			return {
				title: title || videoId || "YouTube Video",
				subtitle: `youtube.com/watch?v=${videoId}`,
			};
		},
	},
});
