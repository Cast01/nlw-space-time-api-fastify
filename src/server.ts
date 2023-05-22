import 'dotenv/config'

import { resolve } from 'node:path'

import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import ffStatic from '@fastify/static'

import { memoriesRoute } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'

import fastify from 'fastify'
const app = fastify()

app.register(cors, {
  origin: true,
})
app.register(jwt, {
  secret: 'spacetime',
})
app.register(multipart)
app.register(ffStatic, {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(authRoutes)
app.register(memoriesRoute)
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
  .catch((err) => console.log(err))
