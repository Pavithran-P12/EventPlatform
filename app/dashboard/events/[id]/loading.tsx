import PageSkeleton from "@/components/page-skeleton";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageSkeleton rows={3} />
    </div>
  );
}
