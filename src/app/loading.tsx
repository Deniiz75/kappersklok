export default function Loading() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-sm text-muted-foreground">Laden...</p>
      </div>
    </section>
  );
}
