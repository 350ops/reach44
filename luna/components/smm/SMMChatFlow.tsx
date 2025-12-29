import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import { PlatformSelector, Platform } from './PlatformSelector';
import { QuantitySlider } from './QuantitySlider';
import { OrderCheckout } from './OrderCheckout';
import AnimatedView from '@/components/AnimatedView';

type FlowState = 'platform' | 'quantity' | 'checkout' | 'completed';

interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string;
}

export const SMMChatFlow: React.FC = () => {
    const colors = useThemeColors();
    const [state, setState] = useState<FlowState>('platform');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', content: "Welcome to reach974. How can I boost your social media today?" },
        { id: '2', role: 'bot', content: "Please select a platform to start." }
    ]);
    const [selection, setSelection] = useState<{
        platform?: Platform;
        followers?: number;
        price?: number;
    }>({});

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, state]);

    const addBotMessage = (content: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'user', content }]);
    };

    const handlePlatformSelect = (platform: Platform) => {
        addUserMessage(platform.charAt(0).toUpperCase() + platform.slice(1));
        setSelection(prev => ({ ...prev, platform }));

        setTimeout(() => {
            addBotMessage(`Great choice! How many ${platform} followers would you like?`);
            setState('quantity');
        }, 600);
    };

    const handleQuantityConfirm = (followers: number, price: number) => {
        addUserMessage(`${followers} followers`);
        setSelection(prev => ({ ...prev, followers, price }));

        setTimeout(() => {
            addBotMessage("Perfect. I've prepared your order. Please provide your target handle and confirm the checkout.");
            setState('checkout');
        }, 600);
    };

    const handleCheckoutSuccess = () => {
        setState('completed');
        setTimeout(() => {
            addBotMessage("Your order has been placed! Our team will start processing it shortly. Thank you for choosing reach974!");
        }, 500);
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            <View className="px-6 pt-24">
                {messages.map((msg) => (
                    <AnimatedView
                        key={msg.id}
                        animation={msg.role === 'bot' ? 'slideInLeft' : 'slideInRight'}
                        className={`mb-6 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <View
                            style={{
                                backgroundColor: msg.role === 'user' ? '#1718FE' : colors.secondary
                            }}
                            className={`max-w-[85%] rounded-3xl px-6 py-4 ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm border border-black/5 dark:border-white/5'
                                }`}
                        >
                            <ThemedText
                                className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white font-outfit-bold' : ''}`}
                            >
                                {msg.content}
                            </ThemedText>
                        </View>
                    </AnimatedView>
                ))}

                {state === 'platform' && (
                    <PlatformSelector onSelect={handlePlatformSelect} />
                )}

                {state === 'quantity' && selection.platform && (
                    <QuantitySlider
                        platform={selection.platform}
                        onConfirm={handleQuantityConfirm}
                    />
                )}

                {state === 'checkout' && selection.platform && selection.followers && selection.price && (
                    <OrderCheckout
                        platform={selection.platform}
                        followers={selection.followers}
                        price={selection.price}
                        onSuccess={handleCheckoutSuccess}
                    />
                )}
            </View>
        </ScrollView>
    );
};
