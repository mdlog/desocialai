import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    return (
        <Loader2
            className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
        />
    );
}

interface LoadingCardProps {
    className?: string;
    showAvatar?: boolean;
    showContent?: boolean;
    lines?: number;
}

export function LoadingCard({
    className,
    showAvatar = true,
    showContent = true,
    lines = 3
}: LoadingCardProps) {
    return (
        <div className={cn("space-y-4 p-6", className)}>
            {showAvatar && (
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
            )}

            {showContent && (
                <div className="space-y-2">
                    {Array.from({ length: lines }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className={cn(
                                "h-4",
                                i === lines - 1 ? "w-[80%]" : "w-full"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface LoadingPostProps {
    className?: string;
}

export function LoadingPost({ className }: LoadingPostProps) {
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

interface LoadingFeedProps {
    count?: number;
    className?: string;
}

export function LoadingFeed({ count = 3, className }: LoadingFeedProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <LoadingPost key={i} />
            ))}
        </div>
    );
}

interface LoadingButtonProps {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export function LoadingButton({
    children,
    loading = false,
    className,
    disabled,
    onClick,
    ...props
}: LoadingButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" />}
            {children}
        </button>
    );
}

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export function LoadingState({
    message = "Loading...",
    className
}: LoadingStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    );
}

interface RefreshButtonProps {
    refreshing?: boolean;
    onRefresh?: () => void;
    className?: string;
}

export function RefreshButton({
    refreshing = false,
    onRefresh,
    className
}: RefreshButtonProps) {
    return (
        <button
            onClick={onRefresh}
            disabled={refreshing}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md",
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                "disabled:opacity-50 disabled:pointer-events-none",
                "transition-colors",
                className
            )}
        >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing..." : "Refresh"}
        </button>
    );
}
