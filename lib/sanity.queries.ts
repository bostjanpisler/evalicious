// ── Recipes ──────────────────────────────────────────────────────────────────

export const recentRecipesQuery = `
  *[_type == "recipe" && published == true] | order(publishedAt desc) [0...6] {
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
  *[_type == "recipe" && published == true] | order(publishedAt desc) {
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
  *[_type == "recipe" && slug.current == $slug][0] {
    _id,
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
    published,
    publishedAt,
    "relatedRecipes": *[_type == "recipe" && published == true && slug.current != ^.slug.current && count((select(defined(categories) => categories, defined(category) => [category], []))[@ in ^.categories]) > 0] | order(publishedAt desc) [0...3] {
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
  *[_type == "blogPost" && published == true] | order(publishedAt desc) {
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
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
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
  *[_type == "travelEntry" && published == true] | order(publishedAt desc) {
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
  *[_type == "travelEntry" && slug.current == $slug][0] {
    _id,
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
    published,
    publishedAt
  }
`;

// ── Products ─────────────────────────────────────────────────────────────────

export const allProductsQuery = `
  *[_type == "product" && published == true] | order(featured desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    type,
    priceInCents,
    currency,
    featured,
    tags,
    "courseStepCount": count(course->steps),
    "courseTotalDuration": math::sum(course->steps[]->durationMinutes)
  }
`;

export const productBySlugQuery = `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    longDescription,
    coverImage,
    type,
    priceInCents,
    currency,
    stripePriceId,
    stripeProductId,
    r2FileKey,
    digitalFile,
    featured,
    published,
    tags,
    course-> {
      _id,
      title,
      "slug": slug.current,
      description,
      "stepCount": count(steps),
      "totalDuration": math::sum(steps[]->durationMinutes)
    }
  }
`;

// ── Courses ─────────────────────────────────────────────────────────────────

export const allCoursesQuery = `
  *[_type == "course" && published == true] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    tags,
    publishedAt,
    "stepCount": count(steps),
    "totalDuration": math::sum(steps[]->durationMinutes)
  }
`;

export const courseBySlugQuery = `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    tags,
    published,
    publishedAt,
    steps[]-> {
      _id,
      title,
      "slug": slug.current,
      description,
      sortOrder,
      durationMinutes,
      isFree
    }
  }
`;

export const courseFullQuery = `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    steps[]-> {
      _id,
      title,
      "slug": slug.current,
      description,
      sortOrder,
      bunnyVideoId,
      durationMinutes,
      isFree,
      "pdfUrl": pdfFile.asset->url,
      content,
      recipe-> {
        _id,
        title,
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
  *[_type == "blogPost" && published == true] | order(publishedAt desc) [0...3] {
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
  *[_type == "travelEntry" && published == true] | order(publishedAt desc) [0...3] {
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
    title,
    "slug": slug.current,
    description,
    coverImage,
    tags,
    publishedAt,
    "stepCount": count(steps),
    "totalDuration": math::sum(steps[]->durationMinutes)
  }
`;

// ── Singleton Pages ──────────────────────────────────────────────────────────

export const homePageQuery = `
  *[_type == "homePage"][0] {
    heroTitle,
    heroSubtitle,
    heroImage,
    featuredRecipes[]-> {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      "categories": select(defined(categories) => categories, defined(category) => [category], []),
      difficulty,
      prepTime,
      cookTime
    },
    featuredProducts[]-> {
      _id,
      title,
      "slug": slug.current,
      description,
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
  *[_type == "aboutPage"][0] {
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
