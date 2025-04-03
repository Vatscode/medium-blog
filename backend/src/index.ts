import { Hono } from 'hono'

const app = new Hono()

app.post('/v1/signup', (c)=> {
  return c.text('Helllo Hono!')

})  

app.post('/v1/signin', (c) => {
  return c.text('Helllo Hono!')

})
app.post('/v1/blog', (c) => {
  return c.text('Helllo Hono!')

})
app.put('/v1/blog', (c) => {
  return c.text('Helllo Hono!')

})

app.get('/v1/blog/:id', (c) => { //dynamic parameters
  return c.text('Helllo Hono!')
})

export default app
