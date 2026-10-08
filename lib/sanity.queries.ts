// Language handling (see sanity/schemas/i18n.ts). Every query takes a `$locale` ("sl" | "en").
// - Recipes, blog posts, travel entries and the home/about pages are one document per language.
// - Products, courses and lessons are one document with an optional `en` override block.
const DOC_LANG = `coalesce(language, "sl") == $locale`;
const OVERRIDE = (field: string) =>
	`select($locale == "en" && defined(en.${field}) => en.${field}, ${field})`;
// Which languages this document exists in (itself plus its translations), for hreflang
// and the language switcher.
const DOC_META = `
    _type,
    "language": coalesce(language, "sl"),
    "root": coalesce(translationOf._ref, _id),
    "translations": *[
      _type == ^._type &&
      published == true &&
      (_id == coalesce(^.translationOf._ref, ^._id) || translationOf._ref == coalesce(^.translationOf._ref, ^._id))
    ] { "language": coalesce(language, "sl"), "slug": slug.current }`;

// ── Recipes ──────────────────────────────────────────────────────────────────

export const recentRecipesQuery = `
  *[_type == "recipe" && ${DOC_LANG} && published == true] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    "categories": select(defined(categories) => categories, defined(category) => [category], []),
    cuisine,
    difficulty,
    prepTime,
    cookTime,
    tags,
    glutenFree,
    sugarFree,
    oilFree,
    soyFree,
    nutFree,
    publishedAt
  }
`;

export const allRecipesQuery = `
  *[_type == "recipe" && ${DOC_LANG} && published == true] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    "categories": select(defined(categories) => categories, defined(category) => [category], []),
    cuisine,
    difficulty,
    prepTime,
    cookTime,
    tags,
    glutenFree,
    sugarFree,
    oilFree,
    soyFree,
    nutFree,
    publishedAt
  }
`;

export const recipeBySlugQuery = `
  *[_type == "recipe" && ${DOC_LANG} && published == true && slug.current == $slug][0] {
    _id,
    ${DOC_META},
    title,
    "slug": slug.current,
    description,
    coverImage,
    "categories": select(defined(categories) => categories, defined(category) => [category], []),
    cuisine,
    difficulty,
    prepTime,
    cookTime,
    servings,
    tags,
    glutenFree,
    sugarFree,
    oilFree,
    soyFree,
    nutFree,
    ingredientGroups[] {
      groupName,
      items[] {
        name,
        amount,
        unit,
        optional
      }
    },
    stepGroups[] {
      groupName,
      items[] {
        instruction,
        tip
      }
    },
    nutritionInfo {
      calories,
      protein,
      fat,
      carbs
    },
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->
      }
    },
    recommendedProducts[] {
      _key,
      name,
      note,
      merchant,
      url,
      image
    },
    published,
    publishedAt,
    "relatedRecipes": *[_type == "recipe" && ${DOC_LANG} && published == true && slug.current != ^.slug.current && count((select(defined(categories) => categories, defined(category) => [category], []))[@ in ^.categories]) > 0] | order(publishedAt desc) [0...3] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      "categories": select(defined(categories) => categories, defined(category) => [category], []),
      cuisine,
      difficulty,
      prepTime,
      cookTime,
      tags,
      glutenFree,
      sugarFree,
      oilFree,
      soyFree,
      nutFree
    }
  }
`;

// ── Blog Posts ────────────────────────────────────────────────────────────────

export const allBlogPostsQuery = `
  *[_type == "blogPost" && ${DOC_LANG} && published == true] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    category,
    tags,
    publishedAt,
    estimatedReadingTime
  }
`;

export const blogPostBySlugQuery = `
  *[_type == "blogPost" && ${DOC_LANG} && published == true && slug.current == $slug][0] {
    _id,
    ${DOC_META},
    title,
    "slug": slug.current,
    description,
    coverImage,
    category,
    tags,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->
      }
    },
    published,
    publishedAt,
    estimatedReadingTime
  }
`;

// ── Travel Entries ───────────────────────────────────────────────────────────

export const allTravelEntriesQuery = `
  *[_type == "travelEntry" && ${DOC_LANG} && published == true] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    location,
    country,
    tags,
    publishedAt
  }
`;

export const travelEntryBySlugQuery = `
  *[_type == "travelEntry" && ${DOC_LANG} && published == true && slug.current == $slug][0] {
    _id,
    ${DOC_META},
    title,
    "slug": slug.current,
    description,
    coverImage,
    location,
    country,
    tags,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->
      }
    },
    recommendedProducts[] {
      _key,
      name,
      note,
      merchant,
      url,
      image
    },
    published,
    publishedAt
  }
`;

// ── Products ─────────────────────────────────────────────────────────────────

export const allProductsQuery = `
  *[_type == "product" && published == true] | order(featured desc, _createdAt desc) {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    coverImage,
    type,
    priceInCents,
    currency,
    featured,
    "tags": ${OVERRIDE("tags")},
    "courseStepCount": count(course->steps),
    "courseTotalDuration": math::sum(course->steps[]->durationMinutes)
  }
`;

export const productBySlugQuery = `
  *[_type == "product" && published == true && slug.current == $slug][0] {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    "longDescription": ${OVERRIDE("longDescription")},
    coverImage,
    type,
    priceInCents,
    currency,
    featured,
    published,
    "tags": ${OVERRIDE("tags")},
    course-> {
      _id,
      "title": ${OVERRIDE("title")},
      "slug": slug.current,
      "description": ${OVERRIDE("description")},
      "stepCount": count(steps),
      "totalDuration": math::sum(steps[]->durationMinutes)
    }
  }
`;

// ── Courses ─────────────────────────────────────────────────────────────────

export const allCoursesQuery = `
  *[_type == "course" && published == true] | order(publishedAt desc) {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    coverImage,
    "tags": ${OVERRIDE("tags")},
    publishedAt,
    "stepCount": count(steps),
    "totalDuration": math::sum(steps[]->durationMinutes)
  }
`;

export const courseBySlugQuery = `
  *[_type == "course" && published == true && slug.current == $slug][0] {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    coverImage,
    "tags": ${OVERRIDE("tags")},
    published,
    publishedAt,
	"shopProduct": *[
		_type == "product" && published == true && type == "ecourse" && course._ref == ^._id
	][0] {
		"slug": slug.current,
		priceInCents
	},
    steps[]-> {
      _id,
      "title": ${OVERRIDE("title")},
      "slug": slug.current,
      "description": ${OVERRIDE("description")},
      sortOrder,
      durationMinutes,
      isFree
    }
  }
`;

export const courseFullQuery = `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    coverImage,
    steps[]-> {
      _id,
      "title": ${OVERRIDE("title")},
      "slug": slug.current,
      "description": ${OVERRIDE("description")},
      sortOrder,
      bunnyVideoId,
      durationMinutes,
      isFree,
      "hasPdf": defined(pdfFile.asset),
      "content": ${OVERRIDE("content")},
      "recipe": select($locale == "en" => coalesce(*[_type == "recipe" && published == true && language == "en" && translationOf._ref == ^.recipe._ref][0], recipe->), recipe->) {
        _id,
        "title": ${OVERRIDE("title")},
        "slug": slug.current,
        coverImage,
        prepTime,
        cookTime,
        servings,
        ingredientGroups[] {
          groupName,
          items[] { name, amount, unit, optional }
        },
        stepGroups[] {
          groupName,
          items[] { instruction, tip }
        }
      }
    }
  }
`;

export const courseStepIdsQuery = `
  *[_type == "course" && _id == $courseId][0] {
    "stepIds": steps[]->_id
  }
`;

// ── Homepage helpers ────────────────────────────────────────────────────────

export const recentBlogPostsQuery = `
  *[_type == "blogPost" && ${DOC_LANG} && published == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    category,
    tags,
    publishedAt,
    estimatedReadingTime
  }
`;

export const recentTravelEntriesQuery = `
  *[_type == "travelEntry" && ${DOC_LANG} && published == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    location,
    country,
    tags,
    publishedAt
  }
`;

export const recentCoursesQuery = `
  *[_type == "course" && published == true] | order(publishedAt desc) [0...3] {
    _id,
    "title": ${OVERRIDE("title")},
    "slug": slug.current,
    "description": ${OVERRIDE("description")},
    coverImage,
    "tags": ${OVERRIDE("tags")},
    publishedAt,
    "stepCount": count(steps),
    "totalDuration": math::sum(steps[]->durationMinutes)
  }
`;

// ── Singleton Pages ──────────────────────────────────────────────────────────

export const homePageQuery = `
  *[_type == "homePage" && ${DOC_LANG}][0] {
    heroTitle,
    heroSubtitle,
    heroImage,
    featuredRecipes[]-> {
      _id,
      "title": ${OVERRIDE("title")},
      "slug": slug.current,
      coverImage,
      "categories": select(defined(categories) => categories, defined(category) => [category], []),
      difficulty,
      prepTime,
      cookTime
    },
    featuredProducts[]-> {
      _id,
      "title": ${OVERRIDE("title")},
      "slug": slug.current,
      "description": ${OVERRIDE("description")},
      coverImage,
      type,
      priceInCents,
      currency,
      "courseStepCount": count(course->steps),
      "courseTotalDuration": math::sum(course->steps[]->durationMinutes)
    }
  }
`;

export const aboutPageQuery = `
  *[_type == "aboutPage" && ${DOC_LANG}][0] {
    title,
    sections[] {
      heading,
      text,
      image
    },
    bio,
    profileImage,
    contactEmail,
    socialLinks[] {
      platform,
      url
    }
  }
`;
