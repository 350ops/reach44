import useThemeColors from '@/app/contexts/ThemeColors';
import AnimatedView from '@/components/AnimatedView';
import ThemedText from '@/components/ThemedText';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { OrderCheckout } from './OrderCheckout';
import { Platform, PlatformSelector } from './PlatformSelector';
import { QuantitySlider } from './QuantitySlider';

type FlowState = 'platform' | 'quantity' | 'checkout' | 'completed';

interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string;
}

type SMMChatFlowProps = {
    onSendMessageRef?: React.MutableRefObject<((text: string) => void) | null>;
};

export const SMMChatFlow: React.FC<SMMChatFlowProps> = ({ onSendMessageRef }) => {
    const colors = useThemeColors();
    const { width: screenWidth } = Dimensions.get('window');
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
    const contentHeightRef = useRef<number>(0);
    
    // Calculate bubble widths: user bubbles wider, bot bubbles narrower
    const userBubbleMaxWidth = screenWidth * 0.95 - 48; // 95% of screen minus padding
    const botBubbleMaxWidth = screenWidth * 0.85 - 48; // 85% of screen minus padding

    const scrollToBottom = React.useCallback(() => {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change, with multiple attempts to ensure it works even with interactive components
        scrollToBottom();
        const timer1 = setTimeout(() => scrollToBottom(), 200);
        const timer2 = setTimeout(() => scrollToBottom(), 400);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [messages, state, scrollToBottom]);

    const addBotMessage = (content: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'user', content }]);
    };

    const handleSendMessage = React.useCallback((text: string) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'user', content: text }]);
        // Scroll to bottom immediately after adding user message
        scrollToBottom();
        setTimeout(() => scrollToBottom(), 200);
        setTimeout(() => scrollToBottom(), 400);
        // You can add bot response logic here if needed
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content: "I understand. Let me help you with that!" }]);
        }, 600);
    }, [scrollToBottom]);

    // Expose handleSendMessage to parent via ref - use useLayoutEffect for synchronous setup
    useLayoutEffect(() => {
        if (onSendMessageRef) {
            onSendMessageRef.current = handleSendMessage;
        }
    }, [onSendMessageRef, handleSendMessage]);

    // Also set in useEffect as backup
    useEffect(() => {
        if (onSendMessageRef) {
            onSendMessageRef.current = handleSendMessage;
        }
        return () => {
            if (onSendMessageRef) {
                onSendMessageRef.current = null;
            }
        };
    }, [onSendMessageRef, handleSendMessage]);

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

    const handleContentSizeChange = React.useCallback((contentWidth: number, contentHeight: number) => {
        // Only scroll if content height increased (new content added)
        if (contentHeight > contentHeightRef.current) {
            contentHeightRef.current = contentHeight;
            scrollToBottom();
        }
    }, [scrollToBottom]);

    return (
        <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 300, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={handleContentSizeChange}
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
                                backgroundColor: msg.role === 'user' ? '#1718FE' : colors.secondary,
                                maxWidth: msg.role === 'user' ? userBubbleMaxWidth : botBubbleMaxWidth,
                            }}
                            className={`rounded-3xl px-6 py-4 ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm border border-black/5 dark:border-white/5'
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

                {/* Interactive components appear after messages */}
                {state === 'platform' && (
                    <View className="mb-6">
                        <PlatformSelector onSelect={handlePlatformSelect} />
                    </View>
                )}

                {state === 'quantity' && selection.platform && (
                    <View className="mb-6">
                        <QuantitySlider
                            platform={selection.platform}
                            onConfirm={handleQuantityConfirm}
                        />
                    </View>
                )}

                {state === 'checkout' && selection.platform && selection.followers && selection.price && (
                    <View className="mb-6">
                        <OrderCheckout
                            platform={selection.platform}
                            followers={selection.followers}
                            price={selection.price}
                            onSuccess={handleCheckoutSuccess}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
};
