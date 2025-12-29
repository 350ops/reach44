import React from 'react';

export const StripeProvider = ({ children }: any) => <>{children}</>;

export const useStripe = () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
    confirmPayment: async () => ({ error: null }),
    createToken: async () => ({ error: null }),
    createPaymentMethod: async () => ({ error: null }),
    retrievePaymentIntent: async () => ({ error: null }),
    retrieveSetupIntent: async () => ({ error: null }),
    confirmSetupIntent: async () => ({ error: null }),
});

export const CardField = () => null;
export const ApplePayButton = () => null;
export const GooglePayButton = () => null;
// Add other exports as needed based on usage
