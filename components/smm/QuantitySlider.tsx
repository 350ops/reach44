import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';
import { Button } from '@/components/Button';
import AnimatedView from '@/components/AnimatedView';

// Price points for interpolation (followers -> QAR)
const PRICE_POINTS: [number, number][] = [
    [0, 0],
    [100, 25],
    [500, 80],
    [1000, 120],
    [3000, 300],
    [5000, 450],
    [10_000, 900],
];

const MAX_FOLLOWERS = 10_000;
const MIN_FOLLOWERS = 100;

function getPriceFromFollowers(followers: number): number {
    if (followers <= 0) return 0;
    if (followers >= MAX_FOLLOWERS) return PRICE_POINTS[PRICE_POINTS.length - 1][1];

    for (let i = 0; i < PRICE_POINTS.length - 1; i++) {
        const [f1, p1] = PRICE_POINTS[i];
        const [f2, p2] = PRICE_POINTS[i + 1];

        if (followers >= f1 && followers <= f2) {
            const t = (followers - f1) / (f2 - f1);
            return Math.round(p1 + t * (p2 - p1));
        }
    }
    return PRICE_POINTS[PRICE_POINTS.length - 1][1];
}

function getFollowersFromPosition(position: number): number {
    if (position <= 0) return 0;
    if (position >= 100) return MAX_FOLLOWERS;

    const normalizedPosition = position / 100;
    let followers = Math.round(normalizedPosition * normalizedPosition * MAX_FOLLOWERS);
    if (followers < MIN_FOLLOWERS) followers = MIN_FOLLOWERS;
    return followers;
}

function roundToStep(n: number, step: number): number {
    if (n <= MIN_FOLLOWERS && n > 0) return MIN_FOLLOWERS;
    return Math.round(n / step) * step;
}

const TRAILING_ZERO_REGEX = /\.0$/;
function formatFollowers(num: number): string {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1).replace(TRAILING_ZERO_REGEX, "")}K`;
    }
    return num.toString();
}

interface QuantitySliderProps {
    platform: string;
    onConfirm: (followers: number, price: number) => void;
}

export const QuantitySlider: React.FC<QuantitySliderProps> = ({ platform, onConfirm }) => {
    const colors = useThemeColors();
    const [sliderValue, setSliderValue] = useState(31.6); // ~1000 followers

    const rawFollowers = getFollowersFromPosition(sliderValue);
    const step = rawFollowers < 500 ? 5 : rawFollowers < 2000 ? 10 : 50;
    const followers = roundToStep(rawFollowers, step);

    const basePrice = getPriceFromFollowers(followers);
    const priceMultiplier = platform?.toLowerCase() === 'tiktok' ? 0.5 : 1;
    const price = Math.round(basePrice * priceMultiplier);

    return (
        <AnimatedView animation="slideInBottom" className="w-full p-4">
            <View
                style={[shadowPresets.large, { backgroundColor: colors.secondary }]}
                className="rounded-3xl p-6"
            >
                <ThemedText className="text-xl font-outfit-bold text-center mb-6">
                    Choose Quantity
                </ThemedText>

                <View className="flex-row justify-between items-center mb-4">
                    <ThemedText className="text-sm opacity-60">Followers</ThemedText>
                    <ThemedText className="text-3xl font-outfit-bold text-highlight">
                        {formatFollowers(followers)}
                    </ThemedText>
                </View>

                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={0.1}
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    minimumTrackTintColor="#1718FE"
                    maximumTrackTintColor={colors.text + '20'}
                    thumbTintColor="#1718FE"
                />

                <View className="flex-row justify-between mb-8 opacity-40">
                    <ThemedText className="text-xs">0</ThemedText>
                    <ThemedText className="text-xs">{formatFollowers(MAX_FOLLOWERS)}</ThemedText>
                </View>

                <View className="border-t border-black/5 dark:border-white/5 pt-6 pb-2">
                    <View className="flex-row justify-between items-center mb-6">
                        <ThemedText className="text-sm opacity-60">Total Price</ThemedText>
                        <ThemedText className="text-2xl font-outfit-bold">
                            {price} QAR
                        </ThemedText>
                    </View>

                    <Button
                        title={`Select ${formatFollowers(followers)} Followers`}
                        onPress={() => onConfirm(followers, price)}
                        className="bg-highlight w-full h-14"
                        textClassName="text-white font-outfit-bold"
                        rounded="full"
                        disabled={followers <= 0}
                    />
                </View>
            </View>
        </AnimatedView>
    );
};
