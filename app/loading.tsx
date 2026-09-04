export default function Loading() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-24 space-y-12 animate-pulse">
            {/* Header / Hero Skeleton */}
            <div className="max-w-3xl mx-auto text-center space-y-4 pt-8">
                <div className="h-6 w-32 mx-auto rounded-full bg-muted/60" />
                <div className="h-12 w-3/4 mx-auto rounded-2xl bg-muted/70" />
                <div className="h-4 w-1/2 mx-auto rounded-lg bg-muted/40" />
            </div>

            {/* Content Cards Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto pt-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4"
                    >
                        <div className="aspect-video w-full rounded-xl bg-muted/50" />
                        <div className="h-5 w-3/4 rounded-md bg-muted/60" />
                        <div className="space-y-2">
                            <div className="h-3.5 w-full rounded bg-muted/40" />
                            <div className="h-3.5 w-4/5 rounded bg-muted/40" />
                        </div>
                        <div className="pt-2 flex gap-2">
                            <div className="h-5 w-16 rounded-full bg-muted/40" />
                            <div className="h-5 w-16 rounded-full bg-muted/40" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
