import manifest from "@/presentation/assets/pets/manifest.json";

const assets = import.meta.glob<string>("../assets/pets/*.webp", {
    eager: true,
    query: "?url&no-inline",
    import: "default",
});
const photos: Record<string, { small: string; large: string }> = manifest;

export function petPhotoSources(photoUrl: string) {
    const photo = photos[photoUrl];
    if (!photo) return { src: photoUrl };

    const small = assets[`../assets/pets/${photo.small}`];
    const large = assets[`../assets/pets/${photo.large}`];
    return {
        src: large,
        srcSet: `${small} 320w, ${large} 640w`,
        sizes: "(min-width: 1152px) 357px, (min-width: 1024px) calc((100vw - 80px) / 3), (min-width: 640px) calc((100vw - 64px) / 2), calc(100vw - 32px)",
    };
}
