import PageSkeleton from "@/components/page-skeleton";

export default function PublicEventsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageSkeleton rows={4} />
    </div>
  );
}
