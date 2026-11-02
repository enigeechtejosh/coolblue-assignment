import { useState } from "react";

import type { ListPets } from "@/application/pets/ListPets";
import type { RemovePet } from "@/application/pets/RemovePet";
import type { SavePet } from "@/application/pets/SavePet";
import type { Pet } from "@/domain/pets/Pet";
import { Topbar } from "@/presentation/components/layout/Topbar";
import { PetDirectory } from "@/presentation/components/PetDirectory";
import { PetEditorSheet } from "@/presentation/components/PetEditorSheet";
import { Toaster } from "@/presentation/components/ui/sonner";
import { LanguageProvider } from "@/presentation/localization/Localization";

interface AppProps {
    listPets: ListPets;
    removePet?: RemovePet;
    savePet?: SavePet;
}

export function App({ listPets, removePet, savePet }: AppProps) {
    return (
        <LanguageProvider>
            <LocalizedApp
                listPets={listPets}
                removePet={removePet}
                savePet={savePet}
            />
        </LanguageProvider>
    );
}

function LocalizedApp({ listPets, removePet, savePet }: AppProps) {
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
                removePet={removePet ?? null}
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
