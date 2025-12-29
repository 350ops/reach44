/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

function patchFile(filePath, patchFn) {
  if (!fs.existsSync(filePath)) {
    console.log(`[postinstall] skip (missing): ${filePath}`);
    return;
  }

  const before = fs.readFileSync(filePath, "utf8");
  const after = patchFn(before);

  if (after === before) {
    console.log(`[postinstall] no changes: ${path.relative(process.cwd(), filePath)}`);
    return;
  }

  fs.writeFileSync(filePath, after, "utf8");
  console.log(`[postinstall] patched: ${path.relative(process.cwd(), filePath)}`);
}

// Fix Expo SDK 54 dev-client iOS build error:
// "value of type 'ExpoReactDelegate' has no member 'reactNativeFactory'"
// Source: expo-dev-launcher references `reactDelegate?.reactNativeFactory`, but ExpoReactDelegate doesn't expose it.
patchFile(
  path.join(
    process.cwd(),
    "node_modules",
    "expo-dev-launcher",
    "ios",
    "ReactDelegateHandler",
    "ExpoDevLauncherReactDelegateHandler.swift"
  ),
  (src) => {
    if (!src.includes("reactDelegate?.reactNativeFactory")) return src;

    let out = src;

    // Remove invalid fallback in the guard.
    out = out.replace(
      /\?\?\s*reactDelegate\?\.\s*reactNativeFactory\s*as\?\s*RCTReactNativeFactory\s*/g,
      ""
    );

    // Remove the invalid recreateRootView fallback branch.
    out = out.replace(
      /\n\s*if let factory = reactDelegate\?\.\s*reactNativeFactory\s*\{\s*\n[\s\S]*?\n\s*\}\s*\n/g,
      "\n"
    );

    return out;
  }
);


