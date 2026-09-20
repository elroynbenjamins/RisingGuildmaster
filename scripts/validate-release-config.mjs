import { readFileSync } from "node:fs";

const EXPECTED_PACKAGE = "com.elroybenjamins.risingguildmaster";
const EXPECTED_ADMOB_APP_ID = "ca-app-pub-2222059903000796~6020835595";
const TEST_PUBLISHER = "ca-app-pub-3940256099942544";
const config = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8")).expo;
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const errors = [];

if (config.android?.package !== EXPECTED_PACKAGE) errors.push(`Android package must be ${EXPECTED_PACKAGE}.`);
if (config.ios?.bundleIdentifier !== EXPECTED_PACKAGE) errors.push(`iOS bundle identifier must be ${EXPECTED_PACKAGE}.`);

const adsPlugin = config.plugins?.find((entry) => Array.isArray(entry) && entry[0] === "react-native-google-mobile-ads");
if (!adsPlugin) errors.push("The Google Mobile Ads Expo plugin is missing.");
else if (adsPlugin[1]?.androidAppId !== EXPECTED_ADMOB_APP_ID) errors.push("The production Android AdMob app ID is incorrect.");
if (adsPlugin?.[1]?.androidAppId?.startsWith(TEST_PUBLISHER)) errors.push("A Google test AdMob app ID cannot be used in production.");

const iapPlugin = config.plugins?.find((entry) => entry === "expo-iap" || (Array.isArray(entry) && entry[0] === "expo-iap"));
if (!iapPlugin) errors.push("The Expo IAP config plugin is missing, so Android billing permission will not be generated.");
if (!packageJson.dependencies?.["expo-iap"]) errors.push("The Expo IAP runtime dependency is missing.");

if (!config.extra?.eas?.projectId) errors.push("The Expo EAS project ID is missing.");
if (!config.icon || !config.android?.adaptiveIcon?.foregroundImage) errors.push("Production app icons are incomplete.");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Release configuration verified for ${EXPECTED_PACKAGE}.`);
