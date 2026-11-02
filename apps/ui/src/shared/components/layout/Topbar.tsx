import { PlusIcon } from "lucide-react";

import { LanguageSelect } from "@/shared/components/layout/LanguageSelect";
import { Button } from "@/shared/components/ui/button";
import { useLocalization } from "@/shared/localization/Localization";

interface TopbarProps {
    readonly onAddPet: () => void;
    readonly addDisabled?: boolean;
}

export function Topbar({ onAddPet, addDisabled = false }: TopbarProps) {
    const { t } = useLocalization();

    return (
        <header data-slot="topbar" className="sticky top-0 z-40 bg-background">
            <div className="flex h-16 w-full items-center justify-end gap-1 px-4 sm:px-6">
                <h1 className="mr-auto text-lg font-semibold tracking-tight">
                    Pets API
                </h1>
                <LanguageSelect />
                <Button onClick={onAddPet} disabled={addDisabled}>
                    <PlusIcon data-icon="inline-start" aria-hidden="true" />
                    {t("addPet")}
                </Button>
            </div>
        </header>
    );
}
