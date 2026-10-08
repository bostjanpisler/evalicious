import { DEFAULT_LOCALE, type Locale } from "../config";
import { createTranslator, type MessageKey, type MessageTree, type Shape } from "../translate";
import { aboutEn } from "./about.en";
import { aboutSl } from "./about.sl";
import { authEn } from "./auth.en";
import { authSl } from "./auth.sl";
import { blogEn } from "./blog.en";
import { blogSl } from "./blog.sl";
import { commonEn } from "./common.en";
import { commonSl } from "./common.sl";
import { coursesEn } from "./courses.en";
import { coursesSl } from "./courses.sl";
import { dashboardEn } from "./dashboard.en";
import { dashboardSl } from "./dashboard.sl";
import { homeEn } from "./home.en";
import { homeSl } from "./home.sl";
import { recipesEn } from "./recipes.en";
import { recipesSl } from "./recipes.sl";
import { shopEn } from "./shop.en";
import { shopSl } from "./shop.sl";
import { travelEn } from "./travel.en";
import { travelSl } from "./travel.sl";

// Slovenian is the source language; the English file of each area must have
// exactly the same keys (enforced by the Shape type).
export const sl = {
	common: commonSl,
	home: homeSl,
	recipes: recipesSl,
	travel: travelSl,
	blog: blogSl,
	shop: shopSl,
	courses: coursesSl,
	dashboard: dashboardSl,
	auth: authSl,
	about: aboutSl,
};

export type Messages = typeof sl;
export type TranslationKey = MessageKey<Messages>;

export const en: Shape<Messages> = {
	common: commonEn,
	home: homeEn,
	recipes: recipesEn,
	travel: travelEn,
	blog: blogEn,
	shop: shopEn,
	courses: coursesEn,
	dashboard: dashboardEn,
	auth: authEn,
	about: aboutEn,
};

export type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const translators: Record<Locale, Translator> = {
	sl: createTranslator<Messages>(sl as MessageTree, sl as MessageTree, "sl"),
	en: createTranslator<Messages>(en as MessageTree, sl as MessageTree, "en"),
};

export function translatorFor(locale: Locale | undefined): Translator {
	return translators[locale ?? DEFAULT_LOCALE];
}
