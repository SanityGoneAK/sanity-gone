// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Import Zod
import { z } from 'astro/zod';

// 4. Define your collection(s)
const guides = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/guides" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        author: z.string(),
        date: z.coerce.date(),
        bannerImage: z.string(),
        operators: z.array(z.string()),
    })
});

const authors = defineCollection({
    loader: file("src/authors.json"),
    schema: z.object({
        username: z.string(),
        bio: z.string(),
        social: z.object({
            youtube: z.string().optional(),
            bluesky: z.string().optional(),
            discord: z.string().optional(),
            reddit: z.string().optional(),
            x: z.string().optional(),
        })
    })
})

// 5. Export a single `collections` object to register your collection(s)
export const collections = { guides, authors };