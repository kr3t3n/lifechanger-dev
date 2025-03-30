export default {
  expo: {
    name: "lifechanger",
    slug: "lifechanger",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.lifechanger"
    },
    android: {
      package: "com.yourcompany.lifechanger"
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png",
      build: {
        babel: {
          dangerouslyAddWebpackConfig: {
            plugins: [],
          },
        },
      },
    },
    extra: {
      garminClientId: process.env.EXPO_PUBLIC_GARMIN_CLIENT_ID,
      garminClientSecret: process.env.EXPO_PUBLIC_GARMIN_CLIENT_SECRET,
      redirectUrl: "https://lovely-nasturtium-df47c6.netlify.app/garmin-callback",
    },
    plugins: ["expo-router"]
  }
}