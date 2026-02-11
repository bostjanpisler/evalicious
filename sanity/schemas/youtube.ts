import { defineType, defineField } from "sanity";

export const youtube = defineType({
	name: "youtube",
	title: "YouTube Embed",
	type: "object",
	fields: [
		defineField({
			name: "videoId",
			title: "Video ID",
			type: "string",
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
