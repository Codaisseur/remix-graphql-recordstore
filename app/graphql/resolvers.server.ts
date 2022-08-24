import invariant from "tiny-invariant";
import {
  createNote,
  deleteNote,
  getNote,
  getNoteListItems,
  updateNote,
} from "~/models/note.server";
import type { Resolvers } from "./resolvers-types";

const resolvers: Resolvers = {
  Query: {
    viewer(_parent, _args, context, _info) {
      return context.user;
    },
    notes(_parent, _args, context, _info) {
      invariant(context.user, "You need to sign in to see your notes.");
      return getNoteListItems({ userId: context.user?.id });
    },
    note(_parent, args, context, _info) {
      invariant(context.user, "You need to sign in to see your notes.");
      return getNote({
        userId: context.user?.id,
        id: args.id,
      });
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
    updateNote(_parent, args, context, _info) {
      if (context.user) {
        return updateNote({
          id: args.id,
          ...args.update,
          userId: context.user.id,
        });
      }
      throw new Error("You need to be signed in to update your notes!");
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
