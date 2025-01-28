import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const baseTextClass = "text-sm md:text-lg";

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

type Props = React.ComponentPropsWithoutRef<typeof Card> & {
  buttonCount: number;
};

const EventDetailsCardSkeleton: React.FC<
  Props
> = ({ className, buttonCount = 3, ...rest }) => {
  return (
    <Card
      className={cn(
        "max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
        className,
      )}
      {...rest}
    >
      <CardHeader className="px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex justify-center">
          <SkeletonLine className="h-7 w-48 sm:h-8 sm:w-56 md:h-9 md:w-64 lg:h-10 lg:w-72" />
        </div>
      </CardHeader>
      <CardContent className="flex justify-center px-4 sm:px-16 md:px-24">
        <div className="grid w-full justify-center gap-y-4 sm:gap-y-5 md:gap-y-6 lg:gap-y-8">
          <div
            className={cn([
              "flex flex-col items-center space-y-2",
              "sm:flex-row sm:items-center sm:justify-between sm:space-x-4 sm:space-y-0",
              "md:space-x-6",
              "lg:space-x-8",
            ])}
          >
            <SkeletonLine className="h-5 w-24 sm:h-6 sm:w-28 md:h-7 md:w-32 lg:h-8 lg:w-36" />
            <div className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5">
              <div className="animate-pulse bg-muted h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" />
              <SkeletonLine className="h-5 w-32 sm:h-6 sm:w-36 md:h-6 md:w-40 lg:h-7 lg:w-44" />
            </div>
          </div>

{/* Start Date */}
          <div
            className={cn([
              "flex flex-col text-[10px] items-center space-y-2",
              "sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:space-y-0",
              "md:text-sm",
              "lg:text-base",
            ])}
          >
            <SkeletonLine className="h-4 w-16 sm:h-5 sm:w-20 md:h-6 md:w-24 lg:h-7 lg:w-28" />
            <SkeletonLine className="h-4 w-32 sm:h-5 sm:w-36 md:h-6 md:w-40 lg:h-7 lg:w-44" />
          </div>

          {/* End Date */}
          <div
            className={cn([
              "flex flex-col text-[10px] items-center space-y-2",
              "sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:space-y-0",
              "md:text-sm",
              "lg:text-base",
            ])}
          >
            <SkeletonLine className="h-4 w-16 sm:h-5 sm:w-20 md:h-6 md:w-24 lg:h-7 lg:w-28" />
            <SkeletonLine className="h-4 w-32 sm:h-5 sm:w-36 md:h-6 md:w-40 lg:h-7 lg:w-44" />
          </div>

          {/* Location */}
          <div
            className={cn([
              "flex flex-col text-[10px] items-center space-y-2",
              "sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:space-y-0",
              "md:text-sm",
              "lg:text-base",
            ])}
          >
            <SkeletonLine className="h-4 w-16 sm:h-5 sm:w-20 md:h-6 md:w-24 lg:h-7 lg:w-28" />
            <SkeletonLine className="h-4 w-32 sm:h-5 sm:w-36 md:h-6 md:w-40 lg:h-7 lg:w-44" />
          </div>
          {/* Group Link Placeholder */}
          <div className="flex items-center justify-center">
            <SkeletonLine className="h-7 w-48 sm:h-8 sm:w-56 md:h-9 md:w-64 lg:h-10 lg:w-72" />
          </div>

          {/* Description */}
          <div
            className={cn([
              baseTextClass,
              "text-justify py-4 space-y-2 sm:py-6 sm:space-y-2 md:py-8 md:space-y-3 lg:py-10 lg:space-y-4",
            ])}
          >
            <SkeletonLine className="h-4 w-full sm:h-5 md:h-5 lg:h-6" />
            <SkeletonLine className="h-4 w-full sm:h-5 md:h-5 lg:h-6" />
            <SkeletonLine className="h-4 w-2/3 sm:h-5 sm:w-3/4 md:h-5 lg:h-6" />
          </div>

          {/* Buttons Placeholder */}
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 h-9 sm:h-10 md:h-11 lg:h-12 w-[288px] sm:w-[336px] md:w-[384px] lg:w-[432px]">
            {new Array(buttonCount).fill(null).map((_, i) => (
              <SkeletonLine key={i} className="h-full w-1/3" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { EventDetailsCardSkeleton };
