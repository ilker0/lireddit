import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./contants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  app.listen(4000, () => {
    console.log("Server started !");
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
};

main();
