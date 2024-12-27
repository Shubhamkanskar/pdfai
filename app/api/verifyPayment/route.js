// app/api/verifyPayment/route.js
import crypto from 'crypto';

export async function POST(req) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = await req.json();

        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(text)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            return new Response(
                JSON.stringify({ verified: true }),
                { headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return new Response(
                JSON.stringify({
                    verified: false,
                    error: 'Invalid signature'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return new Response(
            JSON.stringify({ error: 'Payment verification failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}