"use client";

import { ButtonProps, Button, buttonVariants } from "@/components/ui/button";
import { formatDateRelativeAuto, generateRandomWord } from "../utils";
import { Toggle, ToggleProps } from "@/components/ui/toggle";
import { useLayoutEffect, useState } from "react";
import { Home } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

export const CurrentWordLayout: React.FC<
    {
        wordStr: string;
        status?: React.ReactNode;
        pronunciation?: string;
        addDate?: Date;
        deleteButtonProps: ButtonProps;
        requestAIDefinitionButtonProps: ButtonProps;
        wordUpdateIfLearnedProps: ToggleProps;
    } & React.PropsWithChildren
> = ({
    children,
    status,
    pronunciation,
    addDate,
    wordStr,
    deleteButtonProps,
    requestAIDefinitionButtonProps,
    wordUpdateIfLearnedProps,
}) => {
    const [seed, setSeed] = useState("");

    useLayoutEffect(() => {
        setSeed(generateRandomWord(6));
    }, []);

    const quizUrl = "/vocabulary/training/quiz?seed=" + seed;

    return (
        <div className="flex grow flex-col gap-1 overflow-hidden">
            <div className="flex items-baseline gap-2 justify-between">
                <div className="flex gap-1 items-baseline">
                    <h3 className="text-xl inline">{wordStr}</h3>
                    {pronunciation ? (
                        <span className="text-muted-foreground whitespace-nowrap">
                            {pronunciation}
                        </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {addDate && formatDateRelativeAuto(addDate)}
                    </span>
                </div>
                <Link
                    prefetch
                    href="/vocabulary"
                    className={cn(
                        buttonVariants({
                            variant: "outline",
                            size: "sm",
                        }),
                        "pointer-events-none opacity-50",
                    )}
                >
                    <Home />
                </Link>
            </div>
            <div className="flex flex-col grow overflow-auto">{children}</div>
            <div className="flex text-xs text-muted-foreground">{status}</div>
            <div className="flex justify-between gap-1">
                <div className="flex gap-1">
                    <Link
                        prefetch
                        className={buttonVariants({
                            variant: "default",
                            size: "sm",
                        })}
                        href={quizUrl}
                        shallow
                    >
                        quiz
                    </Link>
                </div>
                <div className="flex gap-1">
                    <Toggle
                        variant="outline"
                        size="sm"
                        className="data-[state=on]:bg-success"
                        {...wordUpdateIfLearnedProps}
                    >
                        learned
                    </Toggle>
                    <Button
                        variant="default"
                        size="sm"
                        {...requestAIDefinitionButtonProps}
                    >
                        update
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        {...deleteButtonProps}
                    >
                        delete
                    </Button>
                </div>
            </div>
        </div>
    );
};
