import type { ReactNode } from "react";

import { useLocalization } from "@/presentation/localization/Localization";

interface DirectoryLayoutProps {
    toolbar?: ReactNode;
    feedback?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export function DirectoryLayout({
    toolbar,
    feedback,
    footer,
    children,
}: DirectoryLayoutProps) {
    const { t } = useLocalization();

    return (
        <section className="min-w-0 space-y-4" aria-label={t("petDirectory")}>
            {toolbar}
            {feedback}
            {children}
            {footer}
        </section>
    );
}
