import { ChevronDownIcon, GlobeIcon } from "lucide-react";

import { Button } from "@/presentation/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";
import {
    type Language,
    useLocalization,
} from "@/presentation/localization/Localization";

const languages = [
    { code: "en", label: "English" },
    { code: "nl", label: "Nederlands" },
] as const;

export function LanguageSelect() {
    const { language, setLanguage, t } = useLocalization();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    aria-label={t("chooseLanguage")}
                >
                    <GlobeIcon data-icon="inline-start" aria-hidden="true" />
                    {language.toUpperCase()}
                    <ChevronDownIcon
                        data-icon="inline-end"
                        aria-hidden="true"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label={t("language")}>
                <DropdownMenuRadioGroup
                    value={language}
                    onValueChange={(value) => setLanguage(value as Language)}
                >
                    {languages.map(({ code, label }) => (
                        <DropdownMenuRadioItem
                            key={code}
                            value={code}
                            lang={code}
                        >
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
