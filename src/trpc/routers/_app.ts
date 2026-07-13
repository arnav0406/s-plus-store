import { createTRPCRouter } from '../init';
import { categoryRouter } from '@/modules/categories/server/procedure';
import { authRouter } from '@/modules/auth/server/procedure';
import { productsRouter } from '@/modules/products/server/procedure';
import { tagsRouter } from '@/modules/tags/server/procedure';
import { tenantsRouter } from '@/modules/tenants/server/procedure';
import { checkoutRouter } from '@/modules/checkout/server/procedure';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    tags: tagsRouter,
    tenants: tenantsRouter,
    products: productsRouter,
    categories: categoryRouter,
    checkout: checkoutRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;