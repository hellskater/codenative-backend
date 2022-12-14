import 'reflect-metadata'
import FileResolver from '@api/resolvers/files.resolver'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault
} from 'apollo-server-core'

export const initializeApolloServer = async (app: any): Promise<void> => {
  // Build the schema
  const schema = await buildSchema({
    resolvers: [FileResolver],
    validate: false,
  })

  // Create the apollo server
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground()
    ]
  })

  // Apply middleware to server
  apolloServer
    .start()
    .then(() => {
      console.log('🚀 Started Apollo server')
      apolloServer.applyMiddleware({ app })
    })
    .catch((err) => console.log(err))
}
