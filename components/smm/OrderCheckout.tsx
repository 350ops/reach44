import useThemeColors from '@/app/contexts/ThemeColors';
import AnimatedView from '@/components/AnimatedView';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { useStripe } from '@/utils/stripe';
import { shadowPresets } from '@/utils/useShadow';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';


interface OrderCheckoutProps {
    platform: string;
    followers: number;
    price: number;
    onSuccess: () => void;
}

import Constants from 'expo-constants';

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
        let url: string | undefined;
        try {
            // On native devices, relative `/api/*` won't work. Use the dev server host in dev,
            // and the production URL in production.
            const configuredOrigin = process.env.EXPO_PUBLIC_API_BASE;
            const origin = configuredOrigin ?? Constants.expoConfig?.extra?.router?.origin ?? 'https://www.reach974.com';
            const debuggerHost = Constants.expoConfig?.hostUri || 'localhost:8081';
            const baseUrl = __DEV__ ? `http://${debuggerHost}` : origin;
            url = `${baseUrl}/api/create-payment-intent`;

            // Debug logging
            console.log('[OrderCheckout] Environment:', __DEV__ ? 'DEV' : 'PRODUCTION');
            console.log('[OrderCheckout] Request URL:', url);
            console.log('[OrderCheckout] Request body:', { followers, targetLink: handle, platforms: platform });

            const requestBody = {
                followers,
                targetLink: handle,
                platforms: platform,
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('[OrderCheckout] Response status:', response.status);
            console.log('[OrderCheckout] Response ok:', response.ok);

            if (!response.ok) {
                const text = await response.text();
                const errorDetails = {
                    status: response.status,
                    statusText: response.statusText,
                    body: text,
                    url: url,
                };
                console.error('[OrderCheckout] Server Error Response:', errorDetails);
                
                // Show detailed error with copy option
                const errorMessage = `Status: ${response.status}\nURL: ${url}\n\n${text.slice(0, 300)}`;
                Alert.alert(
                    'Server Error',
                    errorMessage,
                    [
                        { text: 'Copy Details', onPress: () => Clipboard.setStringAsync(JSON.stringify(errorDetails, null, 2)) },
                        { text: 'OK' }
                    ]
                );
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            console.log('[OrderCheckout] Response data received:', { 
                hasClientSecret: !!data.clientSecret,
                hasError: !!data.error 
            });

            const { clientSecret, error } = data;

            if (error) {
                console.error('[OrderCheckout] API returned error:', error);
                Alert.alert('Payment Error', error);
                setIsProcessing(false);
                return;
            }

            if (!clientSecret) {
                console.error('[OrderCheckout] Missing clientSecret in response:', data);
                Alert.alert('Error', 'Server response missing clientSecret');
                setIsProcessing(false);
                return;
            }

            console.log('[OrderCheckout] Initializing payment sheet...');
            const { error: sheetError } = await initPaymentSheet({
                merchantDisplayName: "reach974",
                paymentIntentClientSecret: clientSecret,
                returnURL: 'luna://stripe-redirect',
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: 'Guest',
                },
            });

            if (!sheetError) {
                console.log('[OrderCheckout] Payment sheet initialized successfully');
                setIsReady(true);
            } else {
                console.error('[OrderCheckout] Payment sheet error:', {
                    code: sheetError.code,
                    message: sheetError.message,
                    type: sheetError.type,
                });
                Alert.alert('Payment Sheet Error', `${sheetError.code}: ${sheetError.message}`);
            }
        } catch (e: any) {
            const safeUrl = typeof url !== 'undefined' ? url : 'unknown';
            const errorDetails = {
                message: e?.message,
                stack: e?.stack,
                name: e?.name,
                url: safeUrl,
                environment: __DEV__ ? 'DEV' : 'PRODUCTION',
            };
            console.error('[OrderCheckout] Exception caught:', errorDetails);
            
            // More specific error messages
            let errorMessage = 'Failed to initialize payment';
            if (e?.message?.includes('Network request failed') || e?.message?.includes('fetch')) {
                errorMessage = `Network error: Could not reach server.\n\nURL: ${safeUrl}\n\nCheck your connection and verify the API is deployed.`;
            } else if (e?.message) {
                errorMessage = `Error: ${e.message}\n\nURL: ${safeUrl}`;
            }
            
            // Show error with copy option for debugging
            Alert.alert(
                'Payment Initialization Failed',
                errorMessage,
                [
                    { 
                        text: 'Copy Error Details', 
                        onPress: () => {
                            Clipboard.setStringAsync(JSON.stringify(errorDetails, null, 2));
                            Alert.alert('Copied!', 'Error details copied to clipboard. Check console for full logs.');
                        }
                    },
                    { text: 'OK' }
                ]
            );
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
