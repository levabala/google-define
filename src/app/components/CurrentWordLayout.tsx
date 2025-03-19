import { ButtonProps, Button } from "@/components/ui/button";
import { Toggle, ToggleProps } from "@/components/ui/toggle";
import { formatDateRelativeAuto } from "../utils";

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
            <div className="flex items-center gap-2 justify-between">
                <span>
                    <h3 className="text-xl inline">{wordStr}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {addDate && formatDateRelativeAuto(addDate)}
                    </span>
                </span>
            </div>
            <div className="flex flex-col grow overflow-auto">{children}</div>
            <div className="flex gap-1 self-end">
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
                <Button variant="destructive" size="sm" {...deleteButtonProps}>
                    delete
                </Button>
            </div>
        </div>
    );
};
