import type { Shape } from "../translate";
import type { aboutSl } from "./about.sl";

export const aboutEn: Shape<typeof aboutSl> = {
	title: "About me",
	profileAlt: "About Eva",
	connect: "Let's connect",
	sidebar: {
		welcome: "Welcome",
		bio: "From cooking workshops to discovering vegan corners around the world — food is my biggest passion and brings all my interests together. If you need inspiration for your next meal, have a browse through the recipes. The content might just give you some cravings 😉",
	},
};
