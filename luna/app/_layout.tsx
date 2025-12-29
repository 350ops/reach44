import { DrawerProvider } from '@/app/contexts/DrawerContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_live_51QiAABDO4BRJvLH7ctaJuK2Hg3srajjDZhxijucRuHhA2RRjguQ1QxB5TL0XfnPINWX8hKtRpY5pZcZErgyI77As00NF3ZMijQ";


NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen
          name="(drawer)"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`} style={{ flex: 1 }}>

      <ThemeProvider>
        <DrawerProvider>
          <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.mmdev13.luna" // Adjust as needed
          >
            <ThemedLayout />
          </StripeProvider>
        </DrawerProvider>
      </ThemeProvider>

    </GestureHandlerRootView>
  );
}
