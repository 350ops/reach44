import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import AnimatedView from '@/components/AnimatedView';
import { useStripe } from '@stripe/stripe-react-native';

interface OrderCheckoutProps {
    platform: string;
    followers: number;
    price: number;
    onSuccess: () => void;
}

import Constants from 'expo-constants';

// Backend URL - Uses the local IP address and correct port for physical devices
const debuggerHost = Constants.expoConfig?.hostUri || 'localhost:8081';
const BACKEND_URL = `http://${debuggerHost}/api/create-payment-intent`;

export const OrderCheckout: React.FC<OrderCheckoutProps> = ({ platform, followers, price, onSuccess }) => {
    const colors = useThemeColors();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [handle, setHandle] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const initializePaymentSheet = async () => {
        if (!handle.trim()) return;

        setIsProcessing(true);
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followers,
                    targetLink: handle,
                    platforms: platform,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("[OrderCheckout] Server Error Response:", text);
                Alert.alert('Error', `Server returned ${response.status}: ${text.slice(0, 100)}`);
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            const { clientSecret, error } = data;

            if (error) {
                Alert.alert('Error', error);
                setIsProcessing(false);
                return;
            }

            const { error: sheetError } = await initPaymentSheet({
                merchantDisplayName: "reach974",
                paymentIntentClientSecret: clientSecret,
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: 'Guest',
                },
            });

            if (!sheetError) {
                setIsReady(true);
            } else {
                Alert.alert('Error', sheetError.message);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to initialize payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!isReady) {
            await initializePaymentSheet();
            return;
        }

        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }
    };

    if (isSuccess) {
        return (
            <AnimatedView animation="scaleIn" className="w-full p-4 items-center">
                <View
                    style={[shadowPresets.large, { backgroundColor: colors.secondary, borderColor: '#22c55e' }]}
                    className="rounded-3xl p-8 items-center border-2 w-full"
                >
                    <View className="bg-green-500/20 p-4 rounded-full mb-4">
                        <Icon name="CheckCircle" size={48} color="#22c55e" />
                    </View>
                    <ThemedText className="text-xl font-outfit-bold text-center">
                        Payment Successful!
                    </ThemedText>
                    <ThemedText className="text-sm opacity-60 text-center mt-2">
                        Your order for {followers} {platform} followers is being processed.
                    </ThemedText>
                </View>
            </AnimatedView>
        );
    }

    return (
        <AnimatedView animation="slideInBottom" className="w-full p-4">
            <View
                style={[shadowPresets.large, { backgroundColor: colors.secondary }]}
                className="rounded-3xl p-6"
            >
                <ThemedText className="text-xl font-outfit-bold mb-6">
                    Checkout Summary
                </ThemedText>

                <View className="space-y-4 mb-8">
                    <View className="flex-row justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                        <ThemedText className="opacity-60 text-sm">Platform</ThemedText>
                        <ThemedText className="font-outfit-bold capitalize">{platform}</ThemedText>
                    </View>
                    <View className="flex-row justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                        <ThemedText className="opacity-60 text-sm">Quantity</ThemedText>
                        <ThemedText className="font-outfit-bold">{followers} Followers</ThemedText>
                    </View>
                    <View className="flex-row justify-between items-center py-3">
                        <ThemedText className="opacity-60 text-sm">Total Price</ThemedText>
                        <ThemedText className="font-outfit-bold text-highlight text-lg">{price} QAR</ThemedText>
                    </View>
                </View>

                <View className="mb-8">
                    <ThemedText className="text-sm font-outfit-bold mb-3">Target Handle / Link</ThemedText>
                    <View
                        style={{ backgroundColor: colors.highlight + '10' }}
                        className="rounded-2xl px-4 py-4 border border-black/5 dark:border-white/5"
                    >
                        <TextInput
                            placeholder="@username or link"
                            placeholderTextColor={colors.text + '40'}
                            value={handle}
                            onChangeText={(text) => {
                                setHandle(text);
                                setIsReady(false); // Reset readiness if handle changes
                            }}
                            className="text-black dark:text-white font-outfit-medium"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <Button
                    title={isReady ? "Pay Now" : "Confirm Details"}
                    onPress={handleConfirm}
                    className="bg-highlight w-full h-14"
                    textClassName="text-white font-outfit-bold"
                    rounded="full"
                    loading={isProcessing}
                    disabled={isProcessing || !handle.trim()}
                />

                <View className="flex-row items-center justify-center mt-4 opacity-40">
                    <Icon name="ShieldCheck" size={14} />
                    <ThemedText className="text-[10px] ml-1 uppercase tracking-widest font-outfit-bold">
                        Secure Encryption • AES-256
                    </ThemedText>
                </View>
            </View>
        </AnimatedView>
    );
};
