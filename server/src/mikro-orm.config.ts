import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./contants";
import { Post } from "./entities/Post";

export default {
  dbName: "lireddit",
  type: "postgresql",
  password: "root",
  debug: !__prod__,
  entities: [Post],
  migrations: {
    path: path.join(__dirname, "../src/migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];
