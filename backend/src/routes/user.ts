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
    if (!authHeader) {
        c.status(403);
        return c.json({
            message: "You're not logged in"
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
        token: jwt,
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
  })
  
  
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
        token: jwt,
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
userRouter.use("/profile", authMiddleware);
userRouter.use("/delete", authMiddleware);

userRouter.put('/profile', async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        // First verify the current password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.password !== body.currentPassword) {
            c.status(403);
            return c.json({
                message: "Current password is incorrect"
            });
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: body.name,
                password: body.newPassword || user.password // Keep old password if no new one provided
            }
        });

        return c.json({
            message: "Profile updated successfully",
            name: updatedUser.name
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        c.status(500);
        return c.json({
            message: "Failed to update profile"
        });
    }
});

userRouter.delete('/delete', async (c) => {
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