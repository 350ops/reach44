import { useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch("/api/stripe-server", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body?.error ?? `Request failed (${response.status})`);
    }
    const { paymentIntent, customerSessionClientSecret, customer } = body as {
      paymentIntent?: string;
      customerSessionClientSecret?: string;
      customer?: string;
    };
    if (!paymentIntent || !customerSessionClientSecret || !customer) {
      throw new Error("Server response missing Stripe secrets.");
    }

    return {
      paymentIntent,
      customerSessionClientSecret,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, customerSessionClientSecret, customer } =
        await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        customerId: customer,
        customerSessionClientSecret,
        applePay: {
          // Must match your Stripe account's country + Apple Pay configuration.
          // You're charging in EUR in the server route; update as needed.
          merchantCountryCode:
            process.env.EXPO_PUBLIC_STRIPE_MERCHANT_COUNTRY_CODE ?? "GB",
        },
        paymentIntentClientSecret: paymentIntent,
        // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
        //methods that complete payment after a delay, like SEPA Debit and Sofort.
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Jane Doe",
        },
        returnURL: "expostripe://stripe-redirect",
      });
      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        return;
      }

      setLoading(true);
    } catch (e: any) {
      Alert.alert("Init failed", e?.message ?? "Unknown error");
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "Your order is confirmed!");
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Button disabled={!loading} title="Checkout" onPress={openPaymentSheet} />
    </SafeAreaView>
  );
}
