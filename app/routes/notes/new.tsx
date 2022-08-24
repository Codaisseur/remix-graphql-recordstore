import { useMutation } from "@apollo/client";
import { Form, useNavigate } from "@remix-run/react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CreateNoteDocument,
  NotesDocument,
} from "~/graphql/graphql-operations";

// type ActionData = {
//   errors?: {
//     title?: string;
//     body?: string;
//   };
// };

// export const action: ActionFunction = async ({ request }) => {
//   const userId = await requireUserId(request);

//   const formData = await request.formData();
//   const title = formData.get("title");
//   const body = formData.get("body");

//   if (typeof title !== "string" || title.length === 0) {
//     return json<ActionData>(
//       { errors: { title: "Title is required" } },
//       { status: 400 }
//     );
//   }

//   if (typeof body !== "string" || body.length === 0) {
//     return json<ActionData>(
//       { errors: { body: "Body is required" } },
//       { status: 400 }
//     );
//   }

//   const note = await createNote({ title, body, userId });

//   return redirect(`/notes/${note.id}`);
// };

type Variables = {
  title: string;
  body: string;
};

export default function NewNotePage() {
  const navigate = useNavigate();
  const [createNoteMutation] = useMutation(CreateNoteDocument);
  const [errors, setErrors] = useState<Partial<Variables>>({});
  const [newNote, setNewNote] = useState({ title: null, body: null });

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const updateNote =
    (
      name: string
    ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (event) => {
      setNewNote({ ...newNote, [name]: event.target.value });
    };

  const validateNote = () => {
    setErrors({});

    if (!newNote.title || newNote.title === "") {
      setErrors({ ...errors, title: "Please provide a title for your note." });
    }
    if (!newNote.body || newNote.body === "") {
      setErrors({
        ...errors,
        body: "Please provide some content for your note.",
      });
    }
  };

  const isValidNote = Object.keys(errors).length === 0;

  const createNote: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    validateNote();

    if (!isValidNote) return;

    await createNoteMutation({
      variables: newNote as unknown as Variables,
      update: (cache, mutationResult) => {
        const { data } = mutationResult;
        if (!data) return; // Cancel updating the cache if no data is returned from mutation.
        const result = cache.readQuery({
          query: NotesDocument,
        });
        const newNotes: any[] = [...(result?.notes || []), data.createNote];
        cache.writeQuery({
          query: NotesDocument,
          data: { notes: newNotes },
        });

        navigate(`/notes/${data.createNote?.id}`);
      },
      errorPolicy: "all",
    });
  };

  useEffect(() => {
    if (errors?.title) {
      titleRef.current?.focus();
    } else if (errors?.body) {
      bodyRef.current?.focus();
    }
  }, [errors]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
      onSubmit={createNote}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={errors?.title ? true : undefined}
            aria-errormessage={errors?.title ? "title-error" : undefined}
            onChange={updateNote("title")}
          />
        </label>
        {errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={errors?.body ? true : undefined}
            aria-errormessage={errors?.body ? "body-error" : undefined}
            onChange={updateNote("body")}
          />
        </label>
        {errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {errors.body}
          </div>
        )}
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
