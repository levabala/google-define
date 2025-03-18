"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as React from "react";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
    "relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline:
                    "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants> & {
        isLoading?: boolean;
    };

const loadingPatch = (props: ToggleProps) => ({
    children: (
        <>
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            <span className="invisible">{props.children}</span>
        </>
    ),
    disabled: true,
});

function Toggle({
    className,
    variant,
    size,
    isLoading,
    ...props
}: ToggleProps) {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
            {...(isLoading && loadingPatch(props))}
        />
    );
}

export { Toggle, toggleVariants };
