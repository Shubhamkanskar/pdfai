"use client";
import { PayPalButtons } from '@paypal/react-paypal-js';
import React from 'react';
import { Check } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const UpgradePlans = () => {
    const upgradeUserPlan = useMutation(api.user.userUpgrade)
    const { user } = useUser()
    const onPaymentSuccess = async () => {
        const result = await upgradeUserPlan({
            userEmail: user?.primaryEmailAddress?.emailAddress


        })
        console.log(result);
        toast.success("Plan upgraded successfully")
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-center mb-2">Choose Your Plan</h2>
            <p className="text-center text-gray-600 mb-4 text-sm">Update your plan to upload multiple PDFs</p>

            <div className="mx-auto max-w-2xl px-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center">
                    {/* Free Plan */}
                    <div className="rounded-lg border border-gray-200 p-4 shadow-sm hover:border-purple-100 hover:shadow-md transition-all duration-200">
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-900">
                                Free
                            </h2>

                            <p className="mt-1">
                                <strong className="text-2xl font-bold text-gray-900">0$</strong>
                                <span className="text-sm font-medium text-gray-700">/month</span>
                            </p>
                        </div>

                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">5 PDF Upload</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Unlimited Notes Taking</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Email support</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Help center access</span>
                            </li>
                        </ul>

                        <button
                            className="mt-4 block w-full rounded-full border border-purple-600 px-4 py-2 text-center text-sm font-medium text-purple-600 hover:bg-purple-50"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Unlimited Plan */}
                    <div className="rounded-lg border border-purple-600 p-4 shadow-md ring-1 ring-purple-600 hover:shadow-lg transition-all duration-200">
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-900">
                                Unlimited
                            </h2>

                            <p className="mt-1">
                                <strong className="text-2xl font-bold text-gray-900">9.99$</strong>
                                <span className="text-sm font-medium text-gray-700">/One Time</span>
                            </p>
                        </div>

                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Unlimited PDF Upload</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Unlimited Notes Taking</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Email support</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Help center access</span>
                            </li>
                        </ul>

                        <div className="mt-4 space-y-2">
                            <PayPalButtons
                                onApprove={() => onPaymentSuccess}
                                onCancel={() => console.log("Payment Cancel")}
                                createOrder={(data, actions) => {
                                    return actions?.order?.create({
                                        purchase_units: [
                                            {
                                                amount: {
                                                    value: 9.99,
                                                    currency_code: "USD",
                                                },
                                            },
                                        ],
                                    });
                                }}

                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePlans;