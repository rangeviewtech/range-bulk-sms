export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="p-6 border rounded-xl bg-card h-24 animate-pulse" />
        ))}
      </div>
      <div className="border rounded-xl p-6 h-64 bg-card animate-pulse" />
    </div>
  );
}
