import { CircleCheckIcon, CircleMinusIcon } from "lucide-react";

import { Badge } from "@/presentation/components/ui/badge";
import { useLocalization } from "@/presentation/localization/Localization";

export function StatusBadge({ available }: { available: boolean }) {
    const { t } = useLocalization();
    const Icon = available ? CircleCheckIcon : CircleMinusIcon;

    return (
        <Badge variant="secondary" data-available={available}>
            <Icon aria-hidden="true" />
            {available ? t("available") : t("unavailable")}
        </Badge>
    );
}
