import { z } from "zod";

const petPhotoUrlSchema = z.union([
    z.url({ protocol: /^https?$/ }),
    z.string().regex(/^\/api\/pet-images\/[0-9a-f-]{36}\/photo\.webp$/),
]);

export const petSchema = z.object({
    id: z.uuidv4(),
    name: z.string().min(1),
    species: z.string().min(1),
    available: z.boolean(),
    birthYear: z.int().positive(),
    dateAdded: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
    photoUrl: petPhotoUrlSchema,
});

export const petListSchema = z.array(petSchema);
