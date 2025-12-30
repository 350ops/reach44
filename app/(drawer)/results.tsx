import { BotSwitch } from '@/components/BotSwitch';
import { ChatInput } from '@/components/ChatInput';
import DrawerButton from '@/components/DrawerButton';
import Header from '@/components/Header';
import { SMMChatFlow } from '@/components/smm/SMMChatFlow';
import ThemedText from '@/components/ThemedText';
import React from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

const ResultsScreen = () => {
    const rightComponents = [
        <BotSwitch key="bot-switch" />
    ];

    const leftComponent = [
        <DrawerButton key="drawer-button" />,
        <ThemedText key="app-title" className='text-2xl font-outfit-bold ml-4'>Reach974<Text className="text-highlight">.</Text></ThemedText>
    ];

    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                style={{ flex: 1 }}
            >
                <Header
                    title=""
                    leftComponent={leftComponent}
                    rightComponents={rightComponents}
                />

                <SMMChatFlow />

                <ChatInput />
            </KeyboardAvoidingView>
        </View>
    );
};

export default ResultsScreen;