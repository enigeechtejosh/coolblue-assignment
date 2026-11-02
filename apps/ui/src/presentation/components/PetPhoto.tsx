import { PawPrintIcon } from "lucide-react";
import { useState } from "react";

import { petPhotoSources } from "@/presentation/lib/petPhotos";
import { useLocalization } from "@/presentation/localization/Localization";

interface PetPhotoProps {
    name: string;
    photoUrl: string;
}

export function PetPhoto({ name, photoUrl }: PetPhotoProps) {
    const { t } = useLocalization();
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div
                data-slot="pet-photo"
                className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
                role="img"
                aria-label={`${name}: photo unavailable`}
            >
                <PawPrintIcon className="size-8" aria-hidden="true" />
                <span className="text-xs">{t("photoUnavailable")}</span>
            </div>
        );
    }

    return (
        <img
            data-slot="pet-photo"
            {...petPhotoSources(photoUrl)}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={853}
            onError={() => setFailed(true)}
            className="aspect-[3/4] w-full bg-muted object-cover"
        />
    );
}
