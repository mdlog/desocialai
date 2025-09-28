import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "bg-muted rounded-md",
  {
    variants: {
      variant: {
        default: "animate-pulse",
        slow: "animate-pulse [animation-duration:2s]",
        fast: "animate-pulse [animation-duration:0.8s]",
        none: "",
      },
      shape: {
        default: "rounded-md",
        avatar: "rounded-full",
        text: "rounded-sm h-4",
        button: "rounded-lg h-10",
        card: "rounded-lg",
      },
      size: {
        default: "",
        sm: "h-4 w-16",
        md: "h-6 w-24",
        lg: "h-8 w-32",
        xl: "h-10 w-40",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
      size: "default",
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  "aria-label"?: string;
}

function Skeleton({
  className,
  variant,
  shape,
  size,
  "aria-label": ariaLabel,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, shape, size }), className)}
      aria-label={ariaLabel || "Loading content"}
      role="status"
      aria-live="polite"
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
