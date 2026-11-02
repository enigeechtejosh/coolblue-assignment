export const apiRoutes = {
    pets: {
        list: "/api/pets",
        detail: (id: string) => `/api/pets/${encodeURIComponent(id)}`,
        create: "/api/pets",
        update: (id: string) => `/api/pets/${encodeURIComponent(id)}`,
        remove: (id: string) => `/api/pets/${encodeURIComponent(id)}`,
    },
} as const;
