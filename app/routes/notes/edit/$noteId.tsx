import { useMutation, useQuery } from "@apollo/client";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useCatch, useNavigate, useParams } from "@remix-run/react";
import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import invariant from "tiny-invariant";
import {
  DeleteNoteDocument,
  NoteDocument,
  NotesDocument,
  UpdateNoteDocument,
} from "~/graphql/graphql-operations";
import { Note } from "~/models/note.server";

export default function NoteEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Pick<Note, "title" | "body">>({
    title: "",
    body: "",
  });

  invariant(params.noteId, "ID param not found");

  const { data, loading } = useQuery(NoteDocument, {
    variables: {
      id: params.noteId,
    },
  });

  const [updateNote] = useMutation(UpdateNoteDocument);

  useEffect(() => {
    if (data?.note) {
      setNote({ title: data.note.title, body: data.note.body! });
    }
  }, [data?.note]);

  const onChangeNote =
    (
      name: string
    ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (event) => {
      setNote({ ...note, [name]: event.target.value });
    };

  const onUpdate: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const noteId = params.noteId;
    invariant(noteId, "This should never happen");

    updateNote({
      variables: {
        id: noteId,
        title: note.title,
        body: note.body,
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
          data: {
            notes: result.notes.map((n) =>
              n?.id === noteId
                ? { ...n, title: note.title, body: note.body }
                : n
            ),
          },
        });

        navigate(`/notes/${params.noteId}`);
      },
      errorPolicy: "all",
    });
  };

  if (loading) {
    return <p>Loading..</p>;
  }

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
      onSubmit={onUpdate}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            onChange={onChangeNote("title")}
            defaultValue={note.title}
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            onChange={onChangeNote("body")}
            defaultValue={note.body}
          />
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
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
