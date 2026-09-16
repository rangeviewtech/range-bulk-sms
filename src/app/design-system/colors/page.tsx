import { cn } from '@/lib/utils';

const colors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  accent: 'bg-accent',
  destructive: 'bg-destructive',
  background: 'bg-background',
  card: 'bg-card',
};

export default function ColorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Colors</h1>
        <p className="text-muted-foreground">Design tokens and semantic colors.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(colors).map(([c, background]) => (
          <div key={c} className="space-y-2">
            <div className={cn('h-24 rounded-lg border shadow-sm', background)} />
            <p className="text-sm font-medium capitalize">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
