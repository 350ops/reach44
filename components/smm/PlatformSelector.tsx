import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';
import AnimatedView from '@/components/AnimatedView';

export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'google';

interface PlatformOption {
    id: Platform;
    label: string;
    icon: any; // Using local assets or icons
}

interface PlatformSelectorProps {
    onSelect: (platform: Platform) => void;
}

const platforms: PlatformOption[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        icon: { uri: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' }
    },
    {
        id: 'facebook',
        label: 'Facebook',
        icon: { uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        icon: { uri: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' }
    },
    {
        id: 'google',
        label: 'Google',
        icon: { uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }
    },
];

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onSelect }) => {
    const colors = useThemeColors();

    return (
        <View className="flex-row flex-wrap justify-between gap-y-3 px-1 py-4">
            {platforms.map((platform, index) => (
                <AnimatedView
                    key={platform.id}
                    animation="scaleIn"
                    delay={index * 100}
                    className="w-[48.5%]"
                >
                    <Pressable
                        onPress={() => onSelect(platform.id)}
                        style={[
                            shadowPresets.card,
                            {
                                backgroundColor: colors.secondary,
                                aspectRatio: 1
                            }
                        ]}
                        className="items-center justify-center rounded-[32px] p-4 active:opacity-70"
                    >
                        <Image
                            source={platform.icon}
                            style={{ width: 44, height: 44 }}
                            resizeMode="contain"
                        />
                        <ThemedText
                            numberOfLines={1}
                            className="mt-3 font-outfit-bold text-[13px] text-center"
                        >
                            {platform.label}
                        </ThemedText>
                    </Pressable>
                </AnimatedView>
            ))}
        </View>
    );
};
