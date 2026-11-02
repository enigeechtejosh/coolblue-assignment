import { ImagePlusIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { DeletePet } from "@/domains/pets/application/use-cases/DeletePet";
import type { SavePet } from "@/domains/pets/application/use-cases/SavePet";
import type { Pet } from "@/domains/pets/domain/models/Pet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import { useLocalization } from "@/shared/localization/Localization";

interface PetEditorSheetProps {
    readonly open: boolean;
    readonly pet: Pet | null;
    readonly deletePet: DeletePet | null;
    readonly savePet: SavePet | null;
    readonly onOpenChange: (open: boolean) => void;
    readonly onSaved: (pet: Pet) => void;
    readonly onRemoved: () => void;
}

type FieldName = "name" | "species" | "birthYear" | "image";
type FieldErrors = Partial<Record<FieldName, string>>;

export function PetEditorSheet({
    open,
    pet,
    deletePet,
    savePet,
    onOpenChange,
    onSaved,
    onRemoved,
}: PetEditorSheetProps) {
    const { t } = useLocalization();
    const formId = useId();
    const [name, setName] = useState("");
    const [species, setSpecies] = useState("Cat");
    const [birthYear, setBirthYear] = useState(
        String(new Date().getFullYear()),
    );
    const [available, setAvailable] = useState(true);
    const [image, setImage] = useState<File | undefined>();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);
    const busy = saving || removing;

    useEffect(() => {
        if (!open) return;
        setName(pet?.name ?? "");
        setSpecies(pet?.species ?? "Cat");
        setBirthYear(String(pet?.birthYear ?? new Date().getFullYear()));
        setAvailable(pet?.available ?? true);
        setImage(undefined);
        setFieldErrors({});
        setFormError(null);
        setRemoving(false);
        setPreviewUrl(pet?.photoUrl ?? null);
    }, [open, pet]);

    useEffect(() => {
        if (!image) return;
        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!savePet || busy) return;

        const form = z
            .object({
                name: z.string().trim().min(1, t("nameRequired")),
                species: z.string().trim().min(1, t("speciesRequired")),
                birthYear: z.coerce
                    .number({ error: t("invalidBirthYear") })
                    .int(t("invalidBirthYear"))
                    .min(1900, t("invalidBirthYear"))
                    .max(new Date().getFullYear(), t("invalidBirthYear")),
                image: pet
                    ? z.instanceof(File).optional()
                    : z.instanceof(File, { error: t("selectPhoto") }),
            })
            .safeParse({ name, species, birthYear, image });

        if (!form.success) {
            const errors: FieldErrors = {};
            for (const issue of form.error.issues) {
                const field = issue.path[0];
                if (
                    typeof field === "string" &&
                    ["name", "species", "birthYear", "image"].includes(field) &&
                    !errors[field as FieldName]
                ) {
                    errors[field as FieldName] = issue.message;
                }
            }
            setFieldErrors(errors);
            setFormError(null);
            return;
        }

        setSaving(true);
        setFieldErrors({});
        setFormError(null);
        try {
            const savedPet = await savePet.execute({
                petId: pet?.id,
                name: form.data.name,
                species: form.data.species,
                available,
                birthYear: form.data.birthYear,
                image: form.data.image,
            });
            toast.success(pet ? t("petUpdated") : t("petAdded"));
            onSaved(savedPet);
        } catch {
            setFormError(t("petSaveFailed"));
            toast.error(t("petSaveFailed"));
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!pet || !deletePet || busy) return;

        setRemoving(true);
        setFormError(null);
        try {
            await deletePet.execute(pet.id);
            toast.success(t("petRemoved"));
            onRemoved();
        } catch {
            setFormError(t("petRemoveFailed"));
            toast.error(t("petRemoveFailed"));
        } finally {
            setRemoving(false);
        }
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(nextOpen) => !busy && onOpenChange(nextOpen)}
        >
            <SheetContent
                closeDisabled={busy}
                closeLabel={t("close")}
                className="w-full gap-0 sm:max-w-xl"
            >
                <SheetHeader className="pr-14">
                    <SheetTitle className="flex min-h-8 items-center">
                        {pet ? t("editPet", { name: pet.name }) : t("addPet")}
                    </SheetTitle>
                    {!pet && (
                        <SheetDescription>
                            {t("newPetDescription")}
                        </SheetDescription>
                    )}
                </SheetHeader>
                <form
                    id={formId}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(event) => void submit(event)}
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
                        {formError && (
                            <div
                                className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                                role="alert"
                            >
                                {formError}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium">
                                {t("photo")}
                            </div>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt={t("petPreview")}
                                    className="aspect-[3/4] w-full rounded-2xl bg-muted object-cover"
                                />
                            )}
                            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 text-sm font-medium transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/30">
                                <ImagePlusIcon
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {image
                                    ? t("chooseAnotherPhoto")
                                    : pet
                                      ? t("replacePhoto")
                                      : t("choosePhoto")}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    disabled={busy}
                                    aria-invalid={Boolean(fieldErrors.image)}
                                    aria-describedby={
                                        fieldErrors.image
                                            ? `${formId}-image-error`
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setImage(event.target.files?.[0]);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            image: undefined,
                                        }));
                                    }}
                                />
                            </label>
                            <InlineError
                                id={`${formId}-image-error`}
                                error={fieldErrors.image}
                            />
                        </div>
                        <Field
                            label={t("name")}
                            htmlFor={`${formId}-name`}
                            error={fieldErrors.name}
                            errorId={`${formId}-name-error`}
                        >
                            <Input
                                id={`${formId}-name`}
                                value={name}
                                maxLength={100}
                                disabled={busy}
                                aria-invalid={Boolean(fieldErrors.name)}
                                aria-describedby={
                                    fieldErrors.name
                                        ? `${formId}-name-error`
                                        : undefined
                                }
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        name: undefined,
                                    }));
                                }}
                            />
                        </Field>
                        <Field
                            label={t("species")}
                            htmlFor={`${formId}-species`}
                            error={fieldErrors.species}
                            errorId={`${formId}-species-error`}
                        >
                            <Input
                                id={`${formId}-species`}
                                value={species}
                                maxLength={50}
                                disabled={busy}
                                aria-invalid={Boolean(fieldErrors.species)}
                                aria-describedby={
                                    fieldErrors.species
                                        ? `${formId}-species-error`
                                        : undefined
                                }
                                onChange={(event) => {
                                    setSpecies(event.target.value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        species: undefined,
                                    }));
                                }}
                            />
                        </Field>
                        <Field
                            label={t("birthYear")}
                            htmlFor={`${formId}-birth-year`}
                            error={fieldErrors.birthYear}
                            errorId={`${formId}-birth-year-error`}
                        >
                            <Input
                                id={`${formId}-birth-year`}
                                type="number"
                                value={birthYear}
                                disabled={busy}
                                aria-invalid={Boolean(fieldErrors.birthYear)}
                                aria-describedby={
                                    fieldErrors.birthYear
                                        ? `${formId}-birth-year-error`
                                        : undefined
                                }
                                onChange={(event) => {
                                    setBirthYear(event.target.value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        birthYear: undefined,
                                    }));
                                }}
                            />
                        </Field>
                        <label
                            htmlFor={`${formId}-available`}
                            className="flex cursor-pointer items-center gap-3 text-sm font-medium"
                        >
                            <Checkbox
                                id={`${formId}-available`}
                                checked={available}
                                disabled={busy}
                                onCheckedChange={(checked) =>
                                    setAvailable(checked === true)
                                }
                            />
                            {t("availableForAdoption")}
                        </label>
                    </div>
                    <SheetFooter className="flex-row justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => onOpenChange(false)}
                        >
                            {t("cancel")}
                        </Button>
                        {pet && deletePet && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={busy}
                                    >
                                        <Trash2Icon
                                            data-icon="inline-start"
                                            aria-hidden="true"
                                        />
                                        {t("removePet")}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("removePetTitle")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("removePetDescription", {
                                                name: pet.name,
                                            })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={removing}>
                                            {t("cancel")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            disabled={removing}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                void remove();
                                            }}
                                        >
                                            {removing
                                                ? t("removing")
                                                : t("confirmRemove")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button type="submit" disabled={busy || !savePet}>
                            {saving && (
                                <LoaderCircleIcon
                                    className="animate-spin"
                                    data-icon="inline-start"
                                    aria-hidden="true"
                                />
                            )}
                            {saving
                                ? t("saving")
                                : pet
                                  ? t("saveChanges")
                                  : t("addPet")}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

function Field({
    label,
    htmlFor,
    error,
    errorId,
    children,
}: {
    readonly label: string;
    readonly htmlFor: string;
    readonly error?: string;
    readonly errorId: string;
    readonly children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={htmlFor} className="block text-sm font-medium">
                {label}
            </label>
            {children}
            <InlineError id={errorId} error={error} />
        </div>
    );
}

function InlineError({
    id,
    error,
}: {
    readonly id: string;
    readonly error?: string;
}) {
    if (!error) return null;

    return (
        <p id={id} className="text-sm text-destructive">
            {error}
        </p>
    );
}
