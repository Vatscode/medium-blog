import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

//hono gives you a single object, hence you dont need req, res,it has c (context), which has its own req, res

const app = new Hono<{ //here you tell ts that im initializing hono with all these env variable
	Bindings: {
		DATABASE_URL: string
	}
}>();


app.post('/v1/signup', (c)=> {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,  // Using generic type to access DATABASE_URL
}).$extends(withAccelerate())


  
  return c.text('Hello Hono!')

})           

app.post('/v1/signin', (c) => {
  return c.text('Hello Hono!')

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
