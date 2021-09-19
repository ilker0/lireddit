import { MikroORM } from '@mikro-orm/core'
import { COOKIE_NAME, __prod__ } from './contants'
import microConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()

  const app = express()

  // Redis
  const redisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      store: new redisStore({
        client: redisClient,
        disableTouch: true
      }),
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__
      },
      secret: '123123123123',
      resave: false
    })
  )

  // Apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path: '/graphql', cors: false })

  app.listen(4000, () => {
    console.log('Server started !')
  })
}

main()
