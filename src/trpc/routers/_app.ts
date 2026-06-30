import { createTRPCRouter } from '../init';
import { categoryRouter } from '@/modules/categories/server/procedure';
import { authRouter } from '@/modules/auth/server/procedure';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    categories: categoryRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;