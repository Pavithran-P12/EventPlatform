import { Suspense } from "react";

import CreateOrganizationForm from "@/app/dashboard/organizations/create-organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Create your organisation
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Organisations own events, members, and registrations. You can create
        more later and switch between them.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <CreateOrganizationForm />
        </Suspense>
      </div>
    </div>
  );
}
