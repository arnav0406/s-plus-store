import { createTRPCRouter } from '../init';
import { categoryRouter } from '@/modules/categories/server/procedure';

export const appRouter = createTRPCRouter({
    categories: categoryRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;