// app/api/createOrder/route.js
import Razorpay from 'razorpay';

export async function POST(req) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const { amount } = await req.json();

        const order = await razorpay.orders.create({
            amount,
            currency: 'USD',
            payment_capture: 1,
        });

        return new Response(JSON.stringify(order), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to create order' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

