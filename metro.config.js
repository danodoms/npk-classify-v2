const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add '.bin' and '.tflite' support for assets
config.resolver.assetExts.push("bin", "tflite", ",lottie");

module.exports = withNativeWind(config, { input: "./global.css" });
