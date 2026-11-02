import type { Pet } from "@/domains/pets/domain/models/Pet";
import { PetPhoto } from "@/domains/pets/presentation/components/PetPhoto";
import { Card } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { useLocalization } from "@/shared/localization/Localization";

interface PetCardProps {
    pet: Pet;
    onEdit: (pet: Pet) => void;
}

export function PetCard({ pet, onEdit }: PetCardProps) {
    const { t } = useLocalization();
    const species =
        pet.species === "Cat"
            ? t("cat")
            : pet.species === "Dog"
              ? t("dog")
              : pet.species;
    return (
        <Card role="article" aria-label={pet.name} className="pet-card">
            <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={t("editPet", { name: pet.name })}
                onClick={() => onEdit(pet)}
            />
            <PetPhoto
                key={pet.photoUrl}
                name={pet.name}
                photoUrl={pet.photoUrl}
            />
            <div className="pet-card-blur" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <div className="pet-card-details" data-slot="card-header">
                <StatusBadge available={pet.available} />
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight break-words">
                        {pet.name}
                    </h2>
                    <p className="text-sm text-white/85">
                        {species} · {t("born")} {pet.birthYear}
                    </p>
                </div>
            </div>
        </Card>
    );
}
