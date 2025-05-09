import z from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export type SigninInput = z.infer<typeof signinInput>

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    media: z.array(z.object({
        type: z.enum(['image', 'video']),
        url: z.string(),
        caption: z.string().optional()
    })).optional()
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.string(),
    media: z.array(z.object({
        type: z.enum(['image', 'video']),
        url: z.string(),
        caption: z.string().optional()
    })).optional()
})
export type UpdateBlogInput = z.infer<typeof updateBlogInput>

export const publishBlogInput = z.object({
    id: z.string()
})
export type PublishBlogInput = z.infer<typeof publishBlogInput>

