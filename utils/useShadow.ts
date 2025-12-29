import { Platform, type ViewStyle } from "react-native";

type ShadowPresetName = "none" | "small" | "medium" | "large";

const ios = {
  none: {} satisfies ViewStyle,
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  } satisfies ViewStyle,
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  } satisfies ViewStyle,
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  } satisfies ViewStyle,
};

const android = {
  none: {} satisfies ViewStyle,
  small: { elevation: 2 } satisfies ViewStyle,
  medium: { elevation: 6 } satisfies ViewStyle,
  large: { elevation: 12 } satisfies ViewStyle,
};

export const shadowPresets: Record<ShadowPresetName, ViewStyle> =
  Platform.OS === "android" ? android : ios;

export default function useShadow(
  preset: ShadowPresetName | number = "medium"
): ViewStyle {
  if (typeof preset === "number") {
    if (preset <= 0) return shadowPresets.none;
    if (preset <= 2) return shadowPresets.small;
    if (preset <= 6) return shadowPresets.medium;
    return shadowPresets.large;
  }
  return shadowPresets[preset] ?? shadowPresets.medium;
}


