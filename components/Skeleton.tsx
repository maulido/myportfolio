import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/40 backdrop-blur-sm shadow-inner",
                className
            )}
            {...props}
        />
    );
}

export function ProjectSkeleton() {
    return (
        <div className="rounded-xl border border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 flex flex-col flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 py-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex justify-between pt-4 mt-auto border-t border-primary/10">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
        </div>
    );
}

export function TestimonialSkeleton() {
    return (
        <div className="glass rounded-xl p-8 relative">
            <Skeleton className="absolute top-4 right-4 h-8 w-8 rounded-full" />
            <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </div>
    );
}

export function GallerySkeleton() {
    return (
        <div className="rounded-xl border border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}

export function CertificationSkeleton() {
    return (
        <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-8 flex flex-col justify-between h-64">
            <div>
                <Skeleton className="h-14 w-14 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-11 w-40 rounded-xl" />
            </div>
        </div>
    );
}
