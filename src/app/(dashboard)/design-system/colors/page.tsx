export default function ColorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Colors</h1>
        <p className="text-muted-foreground">Design tokens and semantic colors.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['primary','secondary','muted','accent','destructive','background','card'].map(c => (
          <div key={c} className="space-y-2">
            <div className={`h-24 rounded-lg bg-${c} border shadow-sm`} />
            <p className="text-sm font-medium capitalize">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
