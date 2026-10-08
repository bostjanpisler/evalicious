import type { Shape } from "../translate";
import type { homeSl } from "./home.sl";

export const homeEn: Shape<typeof homeSl> = {
	hero: {
		imageAlt: "Hero",
		subtitle: "Heavenly recipes and tips for exploring the world",
		cta: "Explore recipes",
	},
	categories: {
		breakfast: "Breakfast",
		main: "Mains",
		sides: "Sides and salads",
		snack: "Snacks",
		dessert: "Desserts",
		drink: "Drinks",
	},
	seeAll: "See all",
	recent: {
		title: "Latest recipes",
		seeAllRecipes: "See all recipes",
	},
	featured: { title: "Featured recipes" },
	blog: { title: "Latest from the blog" },
	travel: { title: "Travel" },
	shop: { title: "Shop" },
	instagram: {
		title: "Instagram",
		bio: "Follow me on Instagram for even more recipes 🌱, travels ✈️ and a peek into my life ✨",
		postAlt: "Instagram post",
		follow: "Follow @susiiiiin",
	},
	about: {
		title: "Get to know me",
		text: "Hey, I'm Eva ✌️ A creator who believes everyday life can become more beautiful and more delicious with a touch of creativity, healthy habits and positive energy. I made this blog for everyone who loves to cook, travel, explore new ideas and look for inspiration for a more balanced lifestyle. With every project I take on, I try to add a personal touch and the authenticity that reflects my approach to cooking, life and storytelling. Thank you for being part of my community ☀️",
		cta: "About me",
	},
	services: {
		title: "Services",
		intro:
			"I'm happy for any opportunity to discover new flavours, get to know products and create authentic content. If you have an idea for a collaboration, or you're looking for fresh ideas, photos or UGC content, you've come to the right place.",
		sponsored: {
			title: "Sponsored posts",
			text: "Promotion of your products and services on my Instagram profile, with a community of over 10k followers.",
		},
		ugc: {
			title: "UGC content",
			text: "Authentic content for your organic profiles, websites or ads (sponsorship ads and dark posts are possible too).",
		},
		recipeDev: {
			title: "Recipe development & photography",
			text: "I love creating new recipes, and even more so showing them off at their best, in video or photos. I can create recipes for your website, social media or print.",
		},
		cta: "Send an enquiry",
	},
};
