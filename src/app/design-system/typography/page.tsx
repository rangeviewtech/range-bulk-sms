export default function TypographyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Typography</h1>
        <p className="text-muted-foreground">Text styles and weights.</p>
      </div>
      <div className="space-y-8">
        <div><span className="text-sm text-muted-foreground">Display</span><h1 className="text-5xl font-extrabold">The quick brown fox</h1></div>
        <div><span className="text-sm text-muted-foreground">H1</span><h1 className="text-4xl font-bold">The quick brown fox</h1></div>
        <div><span className="text-sm text-muted-foreground">Body</span><p className="text-base leading-7">The quick brown fox jumps over the lazy dog.</p></div>
      </div>
    </div>
  );
}
