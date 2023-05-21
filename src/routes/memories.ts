import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

import { z } from 'zod'

/**
 * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiR2FicmllbCBDYXN0aWxobyBGbG9yaWFubyIsImF2YXRhcl91cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvOTMyODg4NzE_dj00Iiwic3ViIjoiZGE4YzVmZTktYmVlMS00ZDQ3LWE4YmQtNWZkYTkzZjRmNmI2IiwiaWF0IjoxNjg0NTE3NTU1LCJleHAiOjE2ODcxMDk1NTV9.UFjOdDYYuZdIwEXXMNIRd_v5fTLCnN8L2PqWon9FmIM"
 */

export async function memoriesRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        exerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        coverUrl,
        content,
        isPublic,
        userId: request.user.sub,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const { userId } = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (userId !== request.user.sub) {
      return reply.status(401).send()
    }

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        coverUrl,
        content,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    })

    const { id } = paramsSchema.parse(request.params)

    const { userId } = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (userId !== request.user.sub) {
      return reply.status(401).send()
    }

    const memory = await prisma.memory.delete({
      where: {
        id,
      },
    })

    return memory
  })
}
