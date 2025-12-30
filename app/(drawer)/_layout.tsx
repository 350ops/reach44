import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Outfit_400Regular, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { useThemeColors } from '../contexts/ThemeColors';

export default function DrawerLayout() {
    const colors = useThemeColors();
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerPosition: 'left',
                drawerStyle: {
                    backgroundColor: colors.bg,
                    //backgroundColor: 'red',
                    width: '85%',
                    flex: 1,
                },
                overlayColor: 'rgba(0,0,0, 0.4)',
                swipeEdgeWidth: 100
            }}
            drawerContent={(props) => <CustomDrawerContent />}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Menu',
                    drawerLabel: 'Menu',
                }}
                //redirect={true}
            />
            <Drawer.Screen
                name="chat"
                options={{
                    drawerLabel: 'Chat',
                    title: 'Chat',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="landing"
                options={{
                    drawerLabel: 'Landing',
                    title: 'Landing',
                }}
            />
        </Drawer>
    );
}