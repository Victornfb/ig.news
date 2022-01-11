import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/react';
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

interface User {
    ref: {
        id: string;
    },
    data: {
        stripe_customer_id: string;
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === "POST") {
        const session = await getSession({ req });

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let custoumerId = user.data.stripe_customer_id

        if(!custoumerId) {
            const stripeCustoumer = await stripe.customers.create({
                email: session.user.email,
                // metadata
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustoumer.id
                        }
                    }
                )
            )

            custoumerId = stripeCustoumer.id
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: custoumerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1KGV6LBX1Pt9tQiDUgLGW3a7', quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id });
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}