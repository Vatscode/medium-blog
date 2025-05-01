import { createBlogInput, updateBlogInput } from "@vatscode/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }, 
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET) as { id: string };
        if (user) {
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});

blogRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { success } = createBlogInput.safeParse(body);
        if (!success) {
            c.status(400);
            return c.json({
                message: "Invalid input format",
                details: "Title and content are required"
            })
        }

        const authorId = c.get("userId");
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })

        return c.json({
            id: blog.id
        })
    } catch (e) {
        console.error("Error creating blog post:", e);
        c.status(500);
        return c.json({
            message: "Error creating blog post",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
})

blogRouter.put('/', async (c) => {
    try {
        const body = await c.req.json();
        const { success } = updateBlogInput.safeParse(body);
        if (!success) {
            c.status(400);
            return c.json({
                message: "Invalid input format",
                details: "ID, title and content are required"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const blog = await prisma.post.update({
            where: {
                id: body.id
            }, 
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({
            id: blog.id
        })
    } catch (e) {
        console.error("Error updating blog post:", e);
        c.status(500);
        return c.json({
            message: "Error updating blog post",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
})

blogRouter.get('/bulk', async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '10');
        const skip = (page - 1) * limit;
        
        const [blogs, total] = await Promise.all([
            prisma.post.findMany({
                select: {
                    content: true,
                    title: true,
                    id: true,
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                skip,
                take: limit,
               
            }),
            prisma.post.count()
        ]);

        return c.json({
            blogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        console.error("Error fetching blogs:", e);
        c.status(500);
        return c.json({
            message: "Error fetching blogs",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
})

blogRouter.get('/:id', async (c) => {
    try {
        const id = c.req.param("id");
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const blog = await prisma.post.findFirst({
            where: {
                id: id
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!blog) {
            c.status(404);
            return c.json({
                message: "Blog not found"
            });
        }

        return c.json({
            blog
        });
    } catch (e) {
        console.error("Error fetching blog:", e);
        c.status(500);
        return c.json({
            message: "Error fetching blog",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
})