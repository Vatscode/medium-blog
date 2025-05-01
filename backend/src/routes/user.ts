import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from "@vatscode/medium-common";
import z from "zod";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

// Custom validation schema that matches frontend input
const frontendSignupInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
});

const frontendSigninInput = z.object({
    username: z.string().email(),
    password: z.string().min(6)
});

userRouter.post('/signup', async (c) => {
    try {
        console.log("Received request at /signup");
        const body = await c.req.json();
        console.log("Request body:", body);
        
        const result = frontendSignupInput.safeParse(body);
        console.log("Validation result:", result);
        
        if (!result.success) {
            console.log("Validation error details:", result.error);
            c.status(400);
            return c.json({
                message: "Invalid input format",
                details: result.error.format()
            });
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
    
        console.log("Creating user with data:", {
            email: body.username,
            password: body.password,
            name: body.name
        });

        const user = await prisma.user.create({
            data: {
                email: body.username,
                password: body.password,
                name: body.name
            }
        });

        console.log("User created successfully:", user);

        const jwt = await sign({
            id: user.id
        }, c.env.JWT_SECRET);
    
        return c.json({ token: jwt });
    } catch(e) {
        console.error("Signup error details:", e);
        c.status(400);
        return c.json({
            message: "Error while signing up",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
});

userRouter.post('/signin', async (c) => {
    try {
        console.log("Received request at /signin");
        const body = await c.req.json();
        console.log("Request body:", body);
        
        const result = frontendSigninInput.safeParse(body);
        console.log("Validation result:", result);
        
        if (!result.success) {
            console.log("Validation error details:", result.error);
            c.status(400);
            return c.json({
                message: "Invalid input format",
                details: result.error.format()
            });
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
    
        console.log("Looking for user with:", {
            email: body.username,
            password: body.password
        });

        const user = await prisma.user.findFirst({
            where: {
                email: body.username,
                password: body.password,
            }
        });

        if (!user) {
            console.log("No user found with provided credentials");
            c.status(401);
            return c.json({
                message: "Invalid credentials"
            });
        }

        console.log("User found:", user);

        const jwt = await sign({
            id: user.id
        }, c.env.JWT_SECRET);
    
        return c.json({ token: jwt });
    } catch(e) {
        console.error("Signin error details:", e);
        c.status(400);
        return c.json({
            message: "Error while signing in",
            error: e instanceof Error ? e.message : "Unknown error"
        });
    }
});