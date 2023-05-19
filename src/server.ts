import fastify from 'fastify'

import cors from '@fastify/cors'

import { memoriesRoute } from './routes/memories'
const app = fastify()

app.register(cors, {
  origin: true,
})
app.register(memoriesRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
  .catch((err) => console.log(err))
