import { DrawerProvider } from '@/app/contexts/DrawerContext';
import { StripeProvider } from '@/utils/stripe';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const MERCHANT_IDENTIFIER = 'merchant.com.mmdev13.luna';
const URL_SCHEME = 'luna';

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
            merchantIdentifier={MERCHANT_IDENTIFIER} // Apple Pay merchant ID
            urlScheme={URL_SCHEME} // 3DS / bank redirects
          >
            <ThemedLayout />
          </StripeProvider>
        </DrawerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
