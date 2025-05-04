import { createBlogInput, updateBlogInput, publishBlogInput } from "@vatscode/writehub-common";
import { PrismaClient, Prisma } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

interface JwtPayload {
    id: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt: Date;
}

interface Like {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
}

interface Post {
    id: string;
    title: string;
    content: string;
    published: boolean;
    authorId: string;
    createdAt: Date;
    likeCount: number;
    likes?: Like[];
    user?: {
        id: string;
        name: string | null;
    };
}

interface BlogResponse {
    id: string;
    title: string;
    content: string;
    published: boolean;
    authorId: string;
    createdAt: Date;
    likeCount: number;
    hasLiked: boolean;
    user: {
        id: string;
        name: string | null;
    };
}

const postSelectFields = {
    id: true,
    title: true,
    content: true,
    published: true,
    authorId: true,
    createdAt: true,
    likeCount: true,
    user: {
        select: {
            id: true,
            name: true
        }
    }
} as const;

type PostWithUser = Prisma.PostGetPayload<{
    select: typeof postSelectFields;
}>;

type PostWithUserAndLikes = Prisma.PostGetPayload<{
    select: {
        id: true;
        title: true;
        content: true;
        published: true;
        authorId: true;
        createdAt: true;
        likeCount: true;
        user: {
            select: {
                id: true;
                name: true;
            }
        };
        likes: {
            select: {
                id: true;
                userId: true;
                postId: true;
                createdAt: true;
            }
        };
    };
}>;

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

    // Get the current user's ID and admin status from token if available
    let currentUserId = null;
    let isAdmin = false;
    const authHeader = c.req.header("authorization");
    if (authHeader) {
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            const payload = await verify(token, c.env.JWT_SECRET) as { id: string };
            currentUserId = payload.id;
            
            // Get admin status
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: {
                    isAdmin: true
                }
            });
            isAdmin = Boolean(dbUser?.isAdmin);
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
            // @ts-ignore
            likeCount: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            // @ts-ignore
            likes: {
                where: currentUserId ? {
                    userId: currentUserId
                } : undefined,
                select: {
                    userId: true
                }
            }
        },
        take: 10,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Transform the response to include hasLiked
    const transformedBlogs: BlogResponse[] = blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        published: blog.published,
        authorId: blog.authorId,
        createdAt: blog.createdAt,
        // @ts-ignore
        likeCount: blog.likeCount,
        // @ts-ignore
        hasLiked: blog.likes?.some(like => like.userId === currentUserId) ?? false,
        user: blog.user
    }));

    return c.json({
        blogs: transformedBlogs,
        currentUserId,
        isAdmin
    });
});

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    // Get current user's ID if available
    let currentUserId = null;
    const authHeader = c.req.header("authorization");
    if (authHeader) {
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            const payload = await verify(token, c.env.JWT_SECRET) as { id: string };
            currentUserId = payload.id;
        } catch (e) {
            console.error("Auth error:", e);
        }
    }

    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id,
                published: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                // @ts-ignore
                likes: currentUserId ? {
                    where: {
                        userId: currentUserId
                    }
                } : false
            }
        });

        if (!blog) {
            c.status(404);
            return c.json({
                message: "Blog post not found"
            });
        }

        // Transform the response to include hasLiked
        const transformedBlog = {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            published: blog.published,
            authorId: blog.authorId,
            createdAt: blog.createdAt,
            // @ts-ignore
            likeCount: blog.likeCount,
            // @ts-ignore
            hasLiked: blog.likes && blog.likes.length > 0,
            user: blog.user
        };
    
        return c.json({
            blog: transformedBlog
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
    console.log('=== Auth Middleware Start ===');
    const authHeader = c.req.header("authorization");
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
        console.log('No auth header found');
        c.status(403);
        return c.json({
            message: "No authorization header"
        });
    }

    try {
        // Extract token from Bearer format
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Extracted token:', token);
        
        const decoded = await verify(token, c.env.JWT_SECRET);
        console.log('Decoded token payload:', decoded);
        
        if (!decoded || typeof decoded !== 'object') {
            console.log('Invalid decoded token format:', decoded);
            throw new Error('Invalid token format');
        }
        
        // @ts-ignore
        const userId = decoded.id;
        console.log('Extracted userId:', userId);
        
        if (!userId) {
            console.log('No userId found in token');
            throw new Error('No userId in token');
        }
        
        c.set("userId", userId);
        console.log('Successfully set userId in context');
        console.log('=== Auth Middleware End ===');
        await next();
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
blogRouter.use("/like", authMiddleware);

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

// Delete route
blogRouter.delete('/:id', async (c) => {
    const blogId = c.req.param("id");
    
    // Handle auth directly
    const authHeader = c.req.header("authorization");
    if (!authHeader) {
        c.status(403);
        return c.json({
            message: "No authorization header"
        });
    }

    try {
        // Extract token and verify
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const decoded = await verify(token, c.env.JWT_SECRET);
        const payload = { id: (decoded as any).id } as JwtPayload;
        const userId = payload.id;
        
        console.log('Delete request:', { blogId, userId });
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        try {
            // Check if user exists and is admin
            const user = await prisma.user.findUnique({
                where: { id: userId }
            }) as User | null;

            if (!user) {
                c.status(403);
                return c.json({
                    message: "User not found"
                });
            }

            console.log('User check:', { userId, isAdmin: user.isAdmin });

            // Get the blog post
            const blog = await prisma.post.findUnique({
                where: { id: blogId }
            });

            console.log('Blog check:', blog);

            if (!blog) {
                c.status(404);
                return c.json({
                    message: "Blog not found"
                });
            }

            // Allow deletion if user is admin or is the author
            if (!user.isAdmin && blog.authorId !== userId) {
                c.status(403);
                return c.json({
                    message: "Not authorized to delete this blog"
                });
            }

            const deletedBlog = await prisma.post.delete({
                where: { id: blogId }
            });

            console.log('Blog deleted successfully:', deletedBlog);
            return c.json({
                message: "Blog deleted successfully"
            });
        } finally {
            await prisma.$disconnect();
        }
    } catch (error) {
        console.error('Error in delete endpoint:', error);
        c.status(500);
        return c.json({
            message: "Error deleting blog",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Add like route with auth middleware
blogRouter.post('/like/:id', async (c) => {
    const blogId = c.req.param("id");
    const userId = c.get("userId");
    
    console.log('Like request:', { blogId, userId });

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const result = await prisma.$transaction(async (tx) => {
            // First check if the post exists and hasn't been liked
            const post = await tx.post.findUnique({
                where: { id: blogId },
                include: {
                    // @ts-ignore
                    likes: {
                        where: {
                            userId
                        }
                    }
                }
            });

            console.log('Found post:', post);

            if (!post) {
                throw new Error("Post not found");
            }

            // @ts-ignore
            if (post.likes.length > 0) {
                throw new Error("Already liked this post");
            }

            console.log('Creating like with:', { userId, blogId });

            // Create the like
            // @ts-ignore
            await tx.like.create({
                data: {
                    id: crypto.randomUUID(),
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    post: {
                        connect: {
                            id: blogId
                        }
                    }
                }
            });

            // Update the post's like count
            const updatedPost = await tx.post.update({
                where: { id: blogId },
                data: {
                    // @ts-ignore
                    likeCount: {
                        increment: 1
                    }
                },
                select: {
                    id: true,
                    // @ts-ignore
                    likeCount: true
                }
            });

            return updatedPost;
        });

        return c.json({
            message: "Post liked successfully",
            // @ts-ignore
            likeCount: result.likeCount
        });
    } catch (e) {
        console.error("Error liking post:", e);
        if (e instanceof Error) {
            if (e.message === "Already liked this post") {
                c.status(400);
            } else if (e.message === "Post not found") {
                c.status(404);
            } else {
                c.status(500);
            }
            return c.json({ message: e.message });
        }
        c.status(500);
        return c.json({
            message: "Error while liking post"
        });
    }
});