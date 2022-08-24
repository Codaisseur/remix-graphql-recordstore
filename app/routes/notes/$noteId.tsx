import { useMutation, useQuery } from "@apollo/client";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useCatch, useNavigate, useParams } from "@remix-run/react";
import { FormEventHandler } from "react";
import invariant from "tiny-invariant";
import {
  DeleteNoteDocument,
  NoteDocument,
  NotesDocument,
} from "~/graphql/graphql-operations";

export default function NoteDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();

  invariant(params.noteId, "ID param not found");

  const { data, loading } = useQuery(NoteDocument, {
    variables: {
      id: params.noteId,
    },
  });

  const [deleteNote] = useMutation(DeleteNoteDocument);

  const onDelete: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const noteId = params.noteId;
    invariant(noteId, "This should never happen");

    deleteNote({
      variables: {
        id: noteId,
      },
      update: (cache, mutationResult) => {
        const { data } = mutationResult;
        if (!data) return; // Cancel updating the cache if no data is returned from mutation.
        const result = cache.readQuery({
          query: NotesDocument,
        });
        if (!result) return;
        cache.writeQuery({
          query: NotesDocument,
          data: { notes: result.notes.filter((n) => n?.id !== noteId) },
        });

        navigate("/notes");
      },
      errorPolicy: "all",
    });
  };

  if (loading) {
    return <p>Loading..</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{data?.note?.title}</h3>
      <p className="py-6">{data?.note?.body}</p>
      <hr className="my-4" />
      <Form method="post" onSubmit={onDelete}>
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
