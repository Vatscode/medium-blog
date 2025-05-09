import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@vatscode/writehub-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

// Auth middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("authorization");
    console.log('Auth header received:', authHeader);
    
    if (!authHeader) {
        console.log('No authorization header found');
        c.status(403);
        return c.json({
            message: "You're not logged in"
        });
    }

    try {
        // Extract token from Bearer format
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Extracted token:', token);
        
        const user = await verify(token, c.env.JWT_SECRET);
        console.log('Verified user:', user);
        
        if (user && user.id) {
            c.set("userId", user.id);
            await next();
        } else {
            console.log('Invalid user data in token');
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

userRouter.post('/signup', async (c) => {     
    const body = await c.req.json();
    console.log('Received signup request with body:', body);
    const validation = signupInput.safeParse(body);
    if (!validation.success) {
        console.log('Validation errors:', validation.error.errors);
        c.status(411);
        return c.json({
            message: "Inputs not correct",
            errors: validation.error.errors
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try {
        // Make the account admin if it's your email
        const isAdmin = body.email === 'vatscode@gmail.com';
        
        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: body.email,
                password: body.password,
                name: body.name,
                isAdmin: isAdmin
            }
        })
        const jwt = await sign({
            id: user.id
        }, c.env.JWT_SECRET);
  
        return c.json({
            token: `Bearer ${jwt}`,
            userId: user.id,
            name: user.name,
            isAdmin: user.isAdmin
        })
    } catch(e) {
        console.error('Error in signup:', e);
        c.status(411);
        return c.json({
            message: "Error creating user",
            error: e instanceof Error ? e.message : String(e)
        });
    }
});
  
  
userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    console.log('Received signin request with body:', body);
    const { success } = signinInput.safeParse(body);
    if (!success) {
        console.log('Validation failed for signin');
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password,
            },
            select: {
                id: true,
                name: true,
                isAdmin: true
            }
        })
        if (!user) {
            c.status(403);
            return c.json({
                message: "Incorrect creds"
            })
        }
        const jwt = await sign({
            id: user.id
        }, c.env.JWT_SECRET);
  
        return c.json({
            token: `Bearer ${jwt}`,
            userId: user.id,
            name: user.name,
            isAdmin: user.isAdmin
        })
    } catch(e) {
        console.log(e);
        c.status(411);
        return c.text('Invalid')
    }
});

// Protected routes with middleware
userRouter.use("/api/v1/user/profile", authMiddleware);
userRouter.use("/api/v1/user/delete", authMiddleware);
userRouter.use("/api/v1/user/profile-image", authMiddleware);

userRouter.put('/api/v1/user/profile', async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        // Update the user without password verification
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: body.name,
                bio: body.bio
            }
        });

        return c.json({
            message: "Profile updated successfully",
            name: updatedUser.name,
            bio: updatedUser.bio
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        c.status(500);
        return c.json({
            message: "Failed to update profile"
        });
    }
});

// Add a GET endpoint to fetch user profile
userRouter.get('/api/v1/user/profile', async (c) => {
    const userId = c.get("userId");
    console.log('Fetching profile for user:', userId);

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        console.log('Attempting to fetch user from database...');
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                bio: true,
                profileImage: true,
                email: true
            }
        });

        if (!user) {
            console.log('User not found in database:', userId);
            c.status(404);
            return c.json({
                message: "User not found"
            });
        }

        console.log('Successfully fetched user profile:', {
            id: userId,
            name: user.name,
            hasBio: !!user.bio,
            hasProfileImage: !!user.profileImage
        });

        return c.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        c.status(500);
        return c.json({
            message: "Failed to fetch profile",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

userRouter.delete('/api/v1/user/delete', async (c) => {
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        // First delete all posts by the user
        await prisma.post.deleteMany({
            where: { authorId: userId }
        });

        // Then delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return c.json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        c.status(500);
        return c.json({
            message: "Failed to delete account"
        });
    }
});

userRouter.post('/api/v1/user/profile-image', async (c) => {
    const userId = c.get("userId");
    console.log('Processing image upload for user:', userId);
    
    try {
        const formData = await c.req.formData();
        console.log('FormData received:', formData);
        
        const image = formData.get('image');
        console.log('Image from formData:', image ? 'present' : 'missing');

        if (!image || !(image instanceof File)) {
            console.log('Invalid image data:', image);
            c.status(400);
            return c.json({
                message: "No image provided or invalid file format"
            });
        }

        // Check file size (5MB)
        if (image.size > 5 * 1024 * 1024) {
            console.log('Image too large:', image.size);
            c.status(400);
            return c.json({
                message: "Image size should be less than 5MB"
            });
        }

        // Check file type
        if (!image.type.startsWith('image/')) {
            console.log('Invalid file type:', image.type);
            c.status(400);
            return c.json({
                message: "Please upload an image file"
            });
        }

        console.log('Processing image upload:', {
            size: image.size,
            type: image.type,
            userId
        });

        // Convert image to base64
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const imageDataUrl = `data:${image.type};base64,${base64Image}`;

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // First check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            console.log('User not found:', userId);
            c.status(404);
            return c.json({
                message: "User not found"
            });
        }

        // Update user's profile image
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                profileImage: imageDataUrl
            }
        });

        console.log('Successfully updated profile image for user:', userId);

        return c.json({
            message: "Profile image updated successfully",
            imageUrl: updatedUser.profileImage
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        c.status(500);
        return c.json({
            message: error instanceof Error ? error.message : "Failed to upload profile image"
        });
    }
});