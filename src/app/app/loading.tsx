export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Lädt …</span>
      <div className="h-8 w-56 rounded-lg bg-surface-3" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface-2" />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-56 rounded-card bg-surface-2" />
        <div className="h-56 rounded-card bg-surface-2" />
      </div>
      <div className="mt-4 h-40 rounded-card bg-surface-2" />
    </div>
  );
}
