import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

// Loading skeleton for post cards
export function PostCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 p-6 border rounded-lg", className)}>
            {/* Header */}
            <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%]" />
            </div>

            {/* Media placeholder */}
            <Skeleton className="h-48 w-full rounded-lg" />

            {/* Actions */}
            <div className="flex items-center space-x-6">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
}

// Loading skeleton for user profile
export function UserProfileSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 p-6", className)}>
            <div className="text-center">
                <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-[200px] mx-auto mb-2" />
                <Skeleton className="h-4 w-[120px] mx-auto mb-4" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                    <div className="p-3 border rounded-2xl">
                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                    <div className="p-3 border rounded-2xl">
                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="p-3 border rounded-2xl">
                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                </div>

                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}

// Loading skeleton for navigation menu
export function NavigationSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-2 p-4", className)}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            ))}
        </div>
    );
}

// Loading skeleton for network status
export function NetworkStatusSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-3 p-4", className)}>
            <div className="flex items-center space-x-2 mb-4">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-[100px]" />
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[80px]" />
                </div>
                <div className="flex justify-between py-2">
                    <Skeleton className="h-4 w-[40px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="flex justify-between py-2">
                    <Skeleton className="h-4 w-[30px]" />
                    <Skeleton className="h-4 w-[60px]" />
                </div>
            </div>
        </div>
    );
}

// Loading skeleton for hashtag trending
export function HashtagTrendingSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-3 p-4", className)}>
            <Skeleton className="h-6 w-[150px] mb-4" />

            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-3 w-[80px]" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-12" />
                </div>
            ))}
        </div>
    );
}

// Loading skeleton for AI recommendations
export function AIRecommendationsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 p-4", className)}>
            <Skeleton className="h-6 w-[200px] mb-4" />

            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Loading skeleton for chat messages
export function ChatMessageSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 p-4", className)}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn(
                    "flex space-x-3",
                    i % 2 === 0 ? "justify-start" : "justify-end"
                )}>
                    {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                    <div className={cn(
                        "max-w-[70%] space-y-2",
                        i % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-500",
                        "p-3 rounded-lg"
                    )}>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-3 w-[40px]" />
                    </div>
                    {i % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                </div>
            ))}
        </div>
    );
}

// Loading skeleton for analytics dashboard
export function AnalyticsDashboardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-6 p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-[80px]" />
                        <Skeleton className="h-3 w-[60px]" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="p-4 border rounded-lg space-y-4">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
}
