"use client";

import { useActionState } from "react";

import {
  createOrganizationAction,
  type ActionState,
} from "@/app/dashboard/organizations/actions";

const initialState: ActionState = {};

export default function CreateOrganizationForm() {
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="org-name" className="text-sm font-medium text-slate-700">
          Organisation name
        </label>
        <input
          id="org-name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          placeholder="e.g. Aurora Tech Society"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />
      </div>
      <div>
        <label htmlFor="org-description" className="text-sm font-medium text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="org-description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="What does your organisation run?"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create organisation"}
      </button>
    </form>
  );
}
