import Stripe from "stripe";

export type ProductMetadata = {
    stripeAccountId: string;
    id: string;
    name: string;
    price: string;
};
export type CheckoutMetadata = {
    userId: string;
};
export type ExpandedLineItem = Stripe.LineItem & {
    price: Stripe.Price & {
        product: Stripe.Product & {
            metadata: ProductMetadata,
        };
    };
};