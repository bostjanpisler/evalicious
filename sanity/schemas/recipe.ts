import { defineType, defineField, defineArrayMember } from "sanity";

export const recipe = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Breakfast", value: "breakfast" },
          { title: "Lunch", value: "lunch" },
          { title: "Dinner", value: "dinner" },
          { title: "Dessert", value: "dessert" },
          { title: "Snack", value: "snack" },
          { title: "Drink", value: "drink" },
        ],
      },
    }),
    defineField({
      name: "cuisine",
      title: "Cuisine",
      type: "string",
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Easy", value: "easy" },
          { title: "Medium", value: "medium" },
          { title: "Hard", value: "hard" },
        ],
      },
    }),
    defineField({
      name: "prepTime",
      title: "Prep Time (minutes)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "cookTime",
      title: "Cook Time (minutes)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "servings",
      title: "Servings",
      type: "number",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "ingredientGroups",
      title: "Ingredient Groups",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "groupName",
              title: "Group Name",
              type: "string",
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "name",
                      title: "Name",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "amount",
                      title: "Amount",
                      type: "string",
                    }),
                    defineField({
                      name: "unit",
                      title: "Unit",
                      type: "string",
                    }),
                    defineField({
                      name: "optional",
                      title: "Optional",
                      type: "boolean",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "stepGroups",
      title: "Step Groups",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "groupName",
              title: "Group Name",
              type: "string",
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "instruction",
                      title: "Instruction",
                      type: "text",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "tip",
                      title: "Tip",
                      type: "string",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "nutritionInfo",
      title: "Nutrition Info",
      type: "object",
      fields: [
        defineField({
          name: "calories",
          title: "Calories",
          type: "number",
        }),
        defineField({
          name: "protein",
          title: "Protein (g)",
          type: "number",
        }),
        defineField({
          name: "fat",
          title: "Fat (g)",
          type: "number",
        }),
        defineField({
          name: "carbs",
          title: "Carbs (g)",
          type: "number",
        }),
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        }),
        defineArrayMember({ type: "youtube" }),
      ],
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
});
