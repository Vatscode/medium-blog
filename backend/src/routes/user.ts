import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from "@vatscode/medium-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

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
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: body.email,
          password: body.password,
          name: body.name
        }
      })
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
  
      return c.json({
        token: jwt,
        userId: user.id
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
        userId: user.id
      })
    } catch(e) {
      console.log(e);
      c.status(411);
      return c.text('Invalid')
    }
  })