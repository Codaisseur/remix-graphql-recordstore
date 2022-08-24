const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
  }

  type Note {
    id: ID!
    title: String!
    body: String
  }

  type NoteID {
    id: ID!
  }

  input NoteInput {
    title: String!
    body: String!
  }

  type Query {
    viewer: User!
    notes: [Note]!
    note(id: ID!): Note
  }

  type Mutation {
    updateEmail(email: String!): User!

    createNote(note: NoteInput!): Note
    updateNote(id: ID!, update: NoteInput!): Note
    deleteNote(id: ID!): NoteID
  }
`;

export default typeDefs;
