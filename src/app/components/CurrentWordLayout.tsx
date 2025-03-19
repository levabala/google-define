import { ButtonProps, Button, buttonVariants } from "@/components/ui/button";
import { Toggle, ToggleProps } from "@/components/ui/toggle";
import { formatDateRelativeAuto } from "../utils";
import { Home } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

export const CurrentWordLayout: React.FC<
    {
        wordStr: string;
        addDate?: Date;
        deleteButtonProps: ButtonProps;
        requestAIDefinitionButtonProps: ButtonProps;
        wordUpdateIfLearnedProps: ToggleProps;
    } & React.PropsWithChildren
> = ({
    children,
    addDate,
    wordStr,
    deleteButtonProps,
    requestAIDefinitionButtonProps,
    wordUpdateIfLearnedProps,
}) => {
    return (
        <div className="flex grow flex-col gap-1 overflow-hidden">
            <div className="flex items-baseline gap-2 justify-between">
                <span>
                    <h3 className="text-xl inline">{wordStr}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {addDate && formatDateRelativeAuto(addDate)}
                    </span>
                </span>
                <Link
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
            <div className="flex justify-between gap-1">
                <Link
                    className={buttonVariants({
                        variant: "default",
                        size: "sm",
                    })}
                    href="/vocabulary/quiz"
                    shallow
                >
                    quiz
                </Link>
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
