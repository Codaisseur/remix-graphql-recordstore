import { createServer } from "@graphql-yoga/common";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import gql from "graphql-tag";

import resolvers from "~/graphql/resolvers.server";
import typeDefs from "~/graphql/schema";
import type { User } from "~/models/user.server";
import { getUser } from "~/session.server";

export type GraphQLContext = {
  user: User | null;
};

const yoga = createServer<GraphQLContext>({
  schema: {
    typeDefs: gql(typeDefs),
    resolvers,
  },
});

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return yoga.handleRequest(request, { user });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  return yoga.handleRequest(request, { user });
};
