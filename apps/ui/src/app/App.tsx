import { useState } from "react";

import type { DeletePet } from "@/domains/pets/application/use-cases/DeletePet";
import type { ListPets } from "@/domains/pets/application/use-cases/ListPets";
import type { SavePet } from "@/domains/pets/application/use-cases/SavePet";
import type { Pet } from "@/domains/pets/domain/models/Pet";
import { PetDirectory } from "@/domains/pets/presentation/components/PetDirectory";
import { PetEditorSheet } from "@/domains/pets/presentation/components/PetEditorSheet";
import { Topbar } from "@/shared/components/layout/Topbar";
import { Toaster } from "@/shared/components/ui/sonner";
import { LanguageProvider } from "@/shared/localization/Localization";

interface AppProps {
    listPets: ListPets;
    deletePet?: DeletePet;
    savePet?: SavePet;
}

export function App({ listPets, deletePet, savePet }: AppProps) {
    return (
        <LanguageProvider>
            <LocalizedApp
                listPets={listPets}
                deletePet={deletePet}
                savePet={savePet}
            />
        </LanguageProvider>
    );
}

function LocalizedApp({ listPets, deletePet, savePet }: AppProps) {
    const [editor, setEditor] = useState<{
        readonly open: boolean;
        readonly pet: Pet | null;
    }>({ open: false, pet: null });
    const [refreshToken, setRefreshToken] = useState(0);

    return (
        <div className="min-h-svh">
            <Topbar
                addDisabled={!savePet}
                onAddPet={() => setEditor({ open: true, pet: null })}
            />
            <main
                id="main-content"
                tabIndex={-1}
                className="mx-auto max-w-6xl px-4 py-6 outline-none sm:px-6"
            >
                <PetDirectory
                    listPets={listPets}
                    refreshToken={refreshToken}
                    onEditPet={(pet) => setEditor({ open: true, pet })}
                />
            </main>
            <PetEditorSheet
                open={editor.open}
                pet={editor.pet}
                deletePet={deletePet ?? null}
                savePet={savePet ?? null}
                onOpenChange={(open) =>
                    setEditor((current) => ({ ...current, open }))
                }
                onSaved={() => {
                    setEditor({ open: false, pet: null });
                    setRefreshToken((token) => token + 1);
                }}
                onRemoved={() => {
                    setEditor({ open: false, pet: null });
                    setRefreshToken((token) => token + 1);
                }}
            />
            <Toaster />
        </div>
    );
}
