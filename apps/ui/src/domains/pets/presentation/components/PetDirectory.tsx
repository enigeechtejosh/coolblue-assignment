import {
    CircleAlertIcon,
    LoaderCircleIcon,
    PawPrintIcon,
    SearchIcon,
    XIcon,
} from "lucide-react";

import type { ListPets } from "@/domains/pets/application/use-cases/ListPets";
import type { Pet } from "@/domains/pets/domain/models/Pet";
import { DirectoryLayout } from "@/domains/pets/presentation/components/layout/DirectoryLayout";
import { PetCard } from "@/domains/pets/presentation/components/PetCard";
import { usePetDirectory } from "@/domains/pets/presentation/hooks/usePetDirectory";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useLocalization } from "@/shared/localization/Localization";

interface PetDirectoryProps {
    listPets: ListPets;
    refreshToken?: number;
    onEditPet: (pet: Pet) => void;
}

export function PetDirectory({
    listPets,
    refreshToken = 0,
    onEditPet,
}: PetDirectoryProps) {
    const { t } = useLocalization();
    const availabilityOptions = [
        { value: "all", label: t("anyStatus") },
        { value: "available", label: t("available") },
        { value: "unavailable", label: t("unavailable") },
    ] as const;
    const speciesOptions = [
        { value: "all", label: t("allPets") },
        { value: "Cat", label: t("cats") },
        { value: "Dog", label: t("dogs") },
    ] as const;
    const {
        species,
        setSpecies,
        state,
        search,
        setSearch,
        availability,
        setAvailability,
        visiblePets,
    } = usePetDirectory(listPets, refreshToken);

    const toolbar = (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto lg:flex-1">
                <div
                    className="relative min-w-0 flex-1 sm:max-w-xs"
                    role="search"
                    aria-label={t("searchPets")}
                >
                    <SearchIcon
                        className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        aria-label={t("searchPets")}
                        placeholder={t("searchPetsPlaceholder")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pr-10 pl-9"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="absolute top-0 right-0"
                            aria-label={t("clearSearch")}
                            onClick={() => setSearch("")}
                        >
                            <XIcon aria-hidden="true" />
                        </Button>
                    )}
                </div>
                <TabsList aria-label={t("petType")} className="shrink-0">
                    {speciesOptions.map((option) => (
                        <TabsTrigger key={option.value} value={option.value}>
                            {option.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <div
                className="flex flex-wrap items-center gap-1 sm:ml-auto"
                role="group"
                aria-label={t("filterByAvailability")}
            >
                {availabilityOptions.map((option) => (
                    <Button
                        key={option.value}
                        variant={
                            availability === option.value
                                ? "secondary"
                                : "ghost"
                        }
                        aria-pressed={availability === option.value}
                        onClick={() => setAvailability(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );

    return (
        <Tabs
            value={species}
            onValueChange={(value) => {
                if (value === "all" || value === "Cat" || value === "Dog")
                    setSpecies(value);
            }}
        >
            <DirectoryLayout toolbar={toolbar}>
                {speciesOptions.map((option) => (
                    <TabsContent
                        key={option.value}
                        value={option.value}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {state.status === "loading" ? (
                            <div
                                className="flex min-h-64 items-center justify-center gap-2 rounded-2xl border text-sm text-muted-foreground"
                                role="status"
                                aria-live="polite"
                            >
                                <LoaderCircleIcon
                                    className="size-4 motion-safe:animate-spin"
                                    aria-hidden="true"
                                />
                                {t("loadingPets")}
                            </div>
                        ) : state.status === "error" ? (
                            <Alert>
                                <CircleAlertIcon aria-hidden="true" />
                                <AlertTitle>{t("unableToLoadPets")}</AlertTitle>
                                <AlertDescription>
                                    {state.message}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                {state.pets.length === 0 ? (
                                    <Empty className="min-h-64 border border-solid rounded-2xl">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <PawPrintIcon aria-hidden="true" />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                {t("noPetsYet")}
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                {t("noPetsDescription")}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : visiblePets.length === 0 ? (
                                    <Empty className="min-h-64">
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                {t("noMatchingPets")}
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                {t("noMatchingPetsDescription")}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <section
                                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                        aria-label={t("pets")}
                                    >
                                        {visiblePets.map((pet) => (
                                            <PetCard
                                                key={pet.id}
                                                pet={pet}
                                                onEdit={onEditPet}
                                            />
                                        ))}
                                    </section>
                                )}
                            </>
                        )}
                    </TabsContent>
                ))}
            </DirectoryLayout>
        </Tabs>
    );
}
