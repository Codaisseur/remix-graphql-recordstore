import { createNote, deleteNote, getNoteListItems } from "~/models/note.server";
import type { Resolvers } from "./resolvers-types";

const resolvers: Resolvers = {
  Query: {
    viewer(_parent, _args, context, _info) {
      return context.user;
    },
    notes(_parent, _args, context, _info) {
      console.log(context.user);
      return getNoteListItems({ userId: context.user?.id });
    },
  },
  Mutation: {
    updateEmail(_parent, args, context, info) {
      if (context.user) {
        return { ...context.user, email: args.email };
      }
    },
    createNote(_parent, args, context, _info) {
      if (context.user) {
        return createNote({
          ...args.note,
          userId: context.user.id,
        });
      }
      throw new Error("You need to be signed in to create notes!");
    },
    deleteNote(_parent, args, context, _info) {
      if (context.user) {
        deleteNote({ id: args.id, userId: context.user.id });
        return { id: args.id };
      }
      throw new Error("You need to be signed in to delete notes!");
    },
  },
};

export default resolvers;