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

    // Get the current user's ID from token if available
    let currentUserId = null;
    const authHeader = c.req.header("authorization");
    if (authHeader) {
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            const user = await verify(token, c.env.JWT_SECRET);
            if (user && user.id) {
                currentUserId = user.id;
            }
        } catch (e) {
            console.error("Auth error in bulk:", e);
        }
    }

    console.log('Current user ID from token:', currentUserId);

    const blogs = await prisma.post.findMany({
        where: {
            published: true
        },
        select: {
            id: true,
            title: true,
            content: true,
            published: true,
            authorId: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        take: 10,
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log('Blogs with authors:', blogs.map(blog => ({
        blogId: blog.id,
        authorId: blog.authorId,
        userName: blog.user.name
    })));

    return c.json({
        blogs,
        currentUserId
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
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                authorId: true,
                createdAt: true,
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
    try {
        const body = await c.req.json();
        console.log('Received publish request with body:', body);
        
        const result = publishBlogInput.safeParse(body);
        if (!result.success) {
            console.error('Validation error:', result.error);
            c.status(400);
            return c.json({
                message: "Invalid request format",
                error: result.error.issues
            });
        }

        const userId = c.get("userId");
        console.log('User ID from token:', userId);

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // First check if the blog exists and belongs to the user
        const existingBlog = await prisma.post.findUnique({
            where: {
                id: body.id
            }
        });

        console.log('Found blog:', existingBlog);

        if (!existingBlog) {
            c.status(404);
            return c.json({
                message: "Blog not found"
            });
        }

        if (existingBlog.authorId !== userId) {
            c.status(403);
            return c.json({
                message: "You don't have permission to publish this blog"
            });
        }

        const blog = await prisma.post.update({
            where: {
                id: body.id
            },
            data: {
                published: true
            }
        });

        console.log('Successfully published blog:', blog);
        return c.json({
            message: "Blog published successfully",
            blog
        });
    } catch (error) {
        console.error('Error publishing blog:', error);
        c.status(500);
        return c.json({
            message: "Failed to publish blog. Please try again."
        });
    }
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