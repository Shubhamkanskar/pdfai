"use client";
import React, { useState } from 'react';
import { Check, Infinity, Shield, Zap, Clock } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const UpgradePlans = () => {
    const upgradeUserPlan = useMutation(api.user.userUpgrade);
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const userInfo = useQuery(api.user.getUserInfo, { userEmail });

    const handlePayment = async () => {
        if (!userEmail) {
            toast.error("User email not found");
            return;
        }

        try {
            setIsLoading(true);
            const res = await loadRazorpay();

            if (!res) {
                toast.error("Razorpay SDK failed to load");
                return;
            }

            const orderResponse = await fetch('/api/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 999,
                }),
            });

            const order = await orderResponse.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: 999,
                currency: "USD",
                name: "PDF AI",
                description: "Premium Plan Upgrade",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await fetch('/api/verifyPayment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.verified) {
                            try {
                                const result = await upgradeUserPlan({
                                    userEmail: userEmail
                                });

                                if (result === 'User upgraded successfully') {
                                    toast.success("Successfully upgraded to premium!");
                                    router.push('/dashboard');
                                } else {
                                    toast.error("Failed to upgrade plan");
                                }
                            } catch (mutationError) {
                                console.error('Mutation error:', mutationError);
                                toast.error("Failed to upgrade plan. Please contact support.");
                            }
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);
                        toast.error("Error processing payment");
                    }
                },
                prefill: {
                    name: user?.fullName,
                    email: userEmail,
                },
                theme: {
                    color: "#7c3aed"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            toast.error("Failed to initialize payment");
        } finally {
            setIsLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upgrade to unlock unlimited PDFs and premium features
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="relative rounded-2xl bg-gray-900 border border-gray-800 p-8 transform transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                                <p className="text-gray-400">Perfect for getting started</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">$0</div>
                                <div className="text-gray-400">Forever free</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-gray-800">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">5 PDF uploads</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-gray-800">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Standard processing speed</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-gray-800">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Basic support</span>
                            </li>
                        </ul>

                        <button
                            className="w-full py-3 rounded-xl bg-gray-800 text-gray-300 font-medium cursor-not-allowed"
                            disabled
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="relative rounded-2xl bg-gray-900 border border-purple-500/30 p-8 transform transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                            RECOMMENDED
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-purple-400 mb-2">Premium</h3>
                                <p className="text-gray-400">Unlimited access</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-purple-400">$9.99</div>
                                <div className="text-gray-400">One-time payment</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <Infinity className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Unlimited PDF uploads</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Priority processing</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Premium support</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-purple-500/10">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Faster processing speed</span>
                            </li>
                        </ul>

                        <button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Processing..." : "Upgrade Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePlans;