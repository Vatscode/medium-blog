import { createBlogInput, updateBlogInput, publishBlogInput } from "@vatscode/medium-common";
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

// Public routes first
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs = await prisma.post.findMany({
        where: {
            published: true
        },
        take: 10,
        include: {
            user: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return c.json({
        blogs
    })
});

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id,
                published: true
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!blog) {
            c.status(404);
            return c.json({
                message: "Blog post not found"
            });
        }
    
        return c.json({
            blog
        });
    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        });
    }
});

// Auth middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader) {
        c.status(403);
        return c.json({
            message: "No authorization header"
        });
    }

    try {
        // Extract token from Bearer format
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        
        const user = await verify(token, c.env.JWT_SECRET);
        if (user && user.id) {
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "Invalid token"
            });
        }
    } catch(e) {
        console.error("Auth error:", e);
        c.status(403);
        return c.json({
            message: "Invalid token"
        });
    }
};

// Protected routes with middleware
blogRouter.use("/create", authMiddleware);
blogRouter.use("/update", authMiddleware);
blogRouter.use("/publish", authMiddleware);
blogRouter.use("/delete", authMiddleware);

blogRouter.post('/create', async (c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const authorId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.create({
        data: {
            id: crypto.randomUUID(),
            title: body.title,
            content: body.content,
            authorId: authorId,
            published: false
        }
    })

    return c.json({
        id: blog.id
    })
});

blogRouter.put('/update', async (c) => {
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

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
});

blogRouter.post('/publish', async (c) => {
    const body = await c.req.json();
    const { success } = publishBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.update({
        where: {
            id: body.id,
            authorId: c.get("userId")
        },
        data: {
            published: true
        }
    });

    return c.json({
        message: "Blog published successfully"
    });
});

blogRouter.delete('/delete/:id', async (c) => {
    const id = c.req.param("id");
    const userId = c.get("userId");
    
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    // First check if the user owns this blog
    const post = await prisma.post.findFirst({
        where: {
            id: id,
            authorId: userId
        }
    });

    if (!post) {
        c.status(403);
        return c.json({
            message: "Not authorized to delete this post"
        });
    }

    // Delete the blog
    await prisma.post.delete({
        where: {
            id: id
        }
    });

    return c.json({
        message: "Blog deleted successfully"
    });
});