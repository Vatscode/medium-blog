import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

//hono gives you a single object, hence you dont need req, res,it has c (context), which has its own req, res

const app = new Hono<{ //here you tell ts that im initializing hono with all these env variable
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string,
	}
}>();


app.post('/v1/signup', async (c)=> {

  const prisma = new PrismaClient({

    
  datasourceUrl: c.env.DATABASE_URL,  // Using generic type to access DATABASE_URL
}).$extends(withAccelerate())

const body = await c.req.json(); //if youre converting your data to json you have to await it
try {
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    }
  });
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt });
} catch(e) {
  return c.status(403);
  return c.json({ error: "error while signing up" });
}
})

app.post('/api/v1/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})


app.post('/v1/blog', (c) => {
  return c.text('Hello Hono!')

})
app.put('/v1/blog', (c) => {
  return c.text('Hello Hono!')

})

app.get('/v1/blog/:id', (c) => { //dynamic parameters
  return c.text('Hello Hono!')
})

export default app
