import i18n from "i18next";
import { type ReactNode, useCallback } from "react";
import {
    I18nextProvider,
    initReactI18next,
    useTranslation,
} from "react-i18next";

export type Language = "en" | "nl";

const languageStorageKey = "pet-directory-language";

const translations = {
    en: {
        addPet: "Add pet",
        allPets: "All pets",
        anyStatus: "Any status",
        available: "Available",
        availableForAdoption: "Available for adoption",
        birthYear: "Birth year",
        born: "Born",
        cancel: "Cancel",
        cat: "Cat",
        cats: "Cats",
        chooseAnotherPhoto: "Choose another photo",
        chooseLanguage: "Choose language",
        choosePhoto: "Choose photo",
        clearSearch: "Clear search",
        close: "Close",
        confirmRemove: "Remove pet",
        dogs: "Dogs",
        dog: "Dog",
        editPet: "Edit {{name}}",
        filterByAvailability: "Filter by availability",
        language: "Language",
        loadingPets: "Loading pets…",
        name: "Name",
        nameRequired: "Enter a name.",
        newPetDescription: "Add a pet and upload a photo for the directory.",
        noMatchingPets: "No matching pets",
        noMatchingPetsDescription:
            "Try a different search, pet type, or availability.",
        noPetsDescription: "No pets have been added yet.",
        noPetsYet: "No pets yet",
        petDirectory: "Pet directory",
        petAdded: "Pet added successfully.",
        petPreview: "Pet preview",
        petRemoved: "Pet removed successfully.",
        petRemoveFailed: "The pet could not be removed.",
        petUpdated: "Pet updated successfully.",
        petType: "Pet type",
        pets: "Pets",
        photo: "Photo",
        photoUnavailable: "Photo unavailable",
        replacePhoto: "Replace photo",
        removePet: "Remove",
        removePetDescription:
            "{{name}} will be permanently removed from the directory.",
        removePetTitle: "Remove this pet?",
        removing: "Removing…",
        saveChanges: "Save changes",
        saving: "Saving…",
        searchPets: "Search pets",
        searchPetsPlaceholder: "Search pets…",
        selectPhoto: "Choose a photo for the new pet.",
        species: "Species",
        speciesRequired: "Enter a species.",
        unableToLoadPets: "Unable to load pets",
        unavailable: "Unavailable",
        invalidBirthYear: "Enter a valid birth year.",
        petSaveFailed: "The pet could not be saved.",
    },
    nl: {
        addPet: "Huisdier toevoegen",
        allPets: "Alle dieren",
        anyStatus: "Elke status",
        available: "Beschikbaar",
        availableForAdoption: "Beschikbaar voor adoptie",
        birthYear: "Geboortejaar",
        born: "Geboren",
        cancel: "Annuleren",
        cat: "Kat",
        cats: "Katten",
        chooseAnotherPhoto: "Andere foto kiezen",
        chooseLanguage: "Taal kiezen",
        choosePhoto: "Foto kiezen",
        clearSearch: "Zoekopdracht wissen",
        close: "Sluiten",
        confirmRemove: "Huisdier verwijderen",
        dogs: "Honden",
        dog: "Hond",
        editPet: "{{name}} bewerken",
        filterByAvailability: "Filteren op beschikbaarheid",
        language: "Taal",
        loadingPets: "Huisdieren laden…",
        name: "Naam",
        nameRequired: "Voer een naam in.",
        newPetDescription: "Voeg een huisdier met foto toe aan het overzicht.",
        noMatchingPets: "Geen overeenkomende dieren",
        noMatchingPetsDescription:
            "Probeer een andere zoekterm, diersoort of beschikbaarheid.",
        noPetsDescription: "Er zijn nog geen huisdieren toegevoegd.",
        noPetsYet: "Nog geen huisdieren",
        petDirectory: "Huisdierenoverzicht",
        petAdded: "Huisdier succesvol toegevoegd.",
        petPreview: "Voorbeeld van huisdierfoto",
        petRemoved: "Huisdier succesvol verwijderd.",
        petRemoveFailed: "Het huisdier kon niet worden verwijderd.",
        petUpdated: "Huisdier succesvol bijgewerkt.",
        petType: "Diersoort",
        pets: "Huisdieren",
        photo: "Foto",
        photoUnavailable: "Foto niet beschikbaar",
        replacePhoto: "Foto vervangen",
        removePet: "Verwijderen",
        removePetDescription:
            "{{name}} wordt permanent uit het overzicht verwijderd.",
        removePetTitle: "Dit huisdier verwijderen?",
        removing: "Verwijderen…",
        saveChanges: "Wijzigingen opslaan",
        saving: "Opslaan…",
        searchPets: "Huisdieren zoeken",
        searchPetsPlaceholder: "Huisdieren zoeken…",
        selectPhoto: "Kies een foto voor het nieuwe huisdier.",
        species: "Diersoort",
        speciesRequired: "Voer een diersoort in.",
        unableToLoadPets: "Huisdieren konden niet worden geladen",
        unavailable: "Niet beschikbaar",
        invalidBirthYear: "Voer een geldig geboortejaar in.",
        petSaveFailed: "Het huisdier kon niet worden opgeslagen.",
    },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

interface LocalizationValue {
    readonly language: Language;
    readonly setLanguage: (language: Language) => void;
    readonly t: (
        key: TranslationKey,
        values?: Record<string, string>,
    ) => string;
}

function initialLanguage(): Language {
    if (typeof window === "undefined") return "en";

    try {
        const stored = window.localStorage.getItem(languageStorageKey);
        if (stored === "en" || stored === "nl") return stored;
    } catch {
        // Storage can be unavailable in privacy-restricted browsers.
    }

    return systemLanguage();
}

function systemLanguage(): Language {
    for (const language of navigator.languages ?? [navigator.language]) {
        const code = language.toLowerCase().split(/[-_]/)[0];
        if (code === "en" || code === "nl") return code;
    }

    return "en";
}

function syncDocumentLanguage(language: string): void {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language === "nl" ? "nl" : "en";
}

i18n.on("languageChanged", syncDocumentLanguage);

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: translations.en },
            nl: { translation: translations.nl },
        },
        lng: initialLanguage(),
        fallbackLng: "en",
        supportedLngs: ["en", "nl"],
        interpolation: { escapeValue: false },
    })
    .then(() => {
        syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
    });

if (typeof window !== "undefined") {
    window.addEventListener("languagechange", () => {
        try {
            if (window.localStorage.getItem(languageStorageKey)) return;
        } catch {
            // Continue with the browser preference when storage is blocked.
        }
        void i18n.changeLanguage(systemLanguage());
    });
}

export function LanguageProvider({
    children,
}: {
    readonly children: ReactNode;
}) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useLocalization(): LocalizationValue {
    const { t: translate, i18n: instance } = useTranslation();
    const language: Language = instance.resolvedLanguage === "nl" ? "nl" : "en";
    const setLanguage = useCallback((nextLanguage: Language) => {
        if (import.meta.env.MODE !== "test") {
            try {
                window.localStorage.setItem(languageStorageKey, nextLanguage);
            } catch {
                // The selection still applies for the current session.
            }
        }
        void i18n.changeLanguage(nextLanguage);
    }, []);
    const t = useCallback(
        (key: TranslationKey, values: Record<string, string> = {}) =>
            String(translate(key, values)),
        [translate],
    );

    return { language, setLanguage, t };
}
