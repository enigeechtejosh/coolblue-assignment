import { cva, type VariantProps } from "class-variance-authority";
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { cn } from "@/shared/utils/utils";

const TabsAnimationContext = React.createContext<{
    readonly activeValue: string | undefined;
    readonly indicatorLayoutId: string;
}>({ activeValue: undefined, indicatorLayoutId: "tabs-active-indicator" });
const TabsListVariantContext = React.createContext<"default" | "line">(
    "default",
);
const loadMotionFeatures = () =>
    import("@/shared/components/ui/motion-features").then(
        (module) => module.default,
    );

function Tabs({
    className,
    orientation = "horizontal",
    value,
    defaultValue,
    onValueChange,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    const layoutGroupId = React.useId();
    const [uncontrolledValue, setUncontrolledValue] =
        React.useState(defaultValue);
    const activeValue = value ?? uncontrolledValue;
    const valueProps =
        value === undefined
            ? defaultValue === undefined
                ? {}
                : { defaultValue }
            : { value };

    function handleValueChange(nextValue: string) {
        if (value === undefined) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
    }

    return (
        <TabsAnimationContext.Provider
            value={{
                activeValue,
                indicatorLayoutId: `${layoutGroupId}-tabs-active-indicator`,
            }}
        >
            <LazyMotion features={loadMotionFeatures} strict>
                <TabsPrimitive.Root
                    data-slot="tabs"
                    data-orientation={orientation}
                    orientation={orientation}
                    className={cn(
                        "group/tabs flex gap-2 data-horizontal:flex-col data-horizontal:gap-6",
                        className,
                    )}
                    {...valueProps}
                    onValueChange={handleValueChange}
                    {...props}
                />
            </LazyMotion>
        </TabsAnimationContext.Provider>
    );
}

const tabsListVariants = cva(
    "group/tabs-list inline-flex w-fit items-center justify-center rounded-full p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
    {
        variants: {
            variant: {
                default: "bg-muted",
                line: "gap-1 bg-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function TabsList({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>) {
    return (
        <TabsListVariantContext.Provider value={variant ?? "default"}>
            <TabsPrimitive.List
                data-slot="tabs-list"
                data-variant={variant}
                className={cn(tabsListVariants({ variant }), className)}
                {...props}
            />
        </TabsListVariantContext.Provider>
    );
}

function TabsTrigger({
    className,
    children,
    value,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    const { activeValue, indicatorLayoutId } =
        React.useContext(TabsAnimationContext);
    const variant = React.useContext(TabsListVariantContext);
    const reduceMotion = usePrefersReducedMotion();
    const active = activeValue === value;

    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            value={value}
            className={cn(
                "relative isolate inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent! px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring data-active:text-foreground disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground dark:data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {active ? (
                <m.span
                    aria-hidden="true"
                    data-slot="tabs-active-indicator"
                    layoutId={indicatorLayoutId}
                    initial={false}
                    transition={
                        reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 500, damping: 40 }
                    }
                    className={cn(
                        "pointer-events-none absolute z-0",
                        variant === "line"
                            ? "bg-foreground group-data-horizontal/tabs:inset-x-0 group-data-horizontal/tabs:bottom-[-5px] group-data-horizontal/tabs:h-0.5 group-data-vertical/tabs:inset-y-0 group-data-vertical/tabs:-right-1 group-data-vertical/tabs:w-0.5"
                            : "inset-0 rounded-full bg-background shadow-xs dark:bg-input/30 dark:ring-1 dark:ring-input",
                    )}
                />
            ) : null}
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                {children}
            </span>
        </TabsPrimitive.Trigger>
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn("flex-1 text-sm outline-none", className)}
            {...props}
        />
    );
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
