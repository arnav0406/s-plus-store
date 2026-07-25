import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

try {
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
    console.log('ACCOUNT OK:', account.id);

    const link = await stripe.v2.core.accountLinks.create({
        account: account.id,
        use_case: {
            type: 'account_onboarding',
            account_onboarding: {
                configurations: ['merchant'],
                refresh_url: 'http://localhost:3000/admin',
                return_url: 'http://localhost:3000/admin',
            },
        },
    });
    console.log('LINK OK:', link.url ? 'got url' : 'no url');
} catch (e) {
    console.error('ERROR:', e.message);
}
