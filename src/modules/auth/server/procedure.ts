import { headers as getHeaders } from "next/headers";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { loginSchema, registerSchema } from "../schemas";
import { generateAuthCookie } from "../utils";
import { stripe } from "@/lib/stripe";


export const authRouter = createTRPCRouter({
    session: baseProcedure.query(async ({ ctx }) => {
        const headers = await getHeaders();

        const session = await ctx.db.auth({ headers });

        return session;
    }),
    register: baseProcedure
        .input(registerSchema)
        .mutation(async ({ input, ctx }) => {

            const existingData = await ctx.db.find({
                collection: "users",
                limit: 1,
                where: {
                    username: {
                        equals: input.username,
                    }
                }
            });
            const existingUser = existingData.docs[0];

            if (existingUser) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Username already taken",
                });
            }

            const account = await stripe.v2.core.accounts.create({
                identity: { country: 'US' },
                configuration: { merchant: {} },
                dashboard: 'none',
                defaults: {
                    responsibilities: {
                        losses_collector: 'stripe',
                        fees_collector: 'application',
                    },
                },
            });


            if (!account) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to create Stripe account",
                });
            }

            const tenant = await ctx.db.create({
                collection: "tenants",
                data: {
                    name: input.username,
                    slug: input.username,
                    stripeAccountId: account.id,
                },
                overrideAccess: true,
            })

            await ctx.db.create({
                collection: "users",
                data: {
                    username: input.username,
                    email: input.email,
                    password: input.password,
                    tenants: [
                        {
                            tenant: tenant.id,
                        },
                    ],
                },
            });
            const data = await ctx.db.login({
                collection: "users",
                data: {
                    email: input.email,
                    password: input.password,
                },
            });
            if (!data.token) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Failed to login"
                })
            }
            await generateAuthCookie({
                prefix: ctx.db.config.cookiePrefix,
                value: data.token,
            });
        }),
    login: baseProcedure
        .input(loginSchema)
        .mutation(async ({ input, ctx }) => {
            const data = await ctx.db.login({
                collection: "users",
                data: {
                    email: input.email,
                    password: input.password,
                },
            });
            if (!data.token) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Failed to login"
                })
            }

            await generateAuthCookie({
                prefix: ctx.db.config.cookiePrefix,
                value: data.token,
            });

            return data;
        }),
});