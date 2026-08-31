import { describe, expect, it } from "vitest";
import appJson from "../app.json";

const app = appJson.expo;

describe("production identity", () => {
  it("uses the Google Play package name everywhere", () => {
    expect(app.android.package).toBe("com.elroybenjamins.risingguildmaster");
    expect(app.ios.bundleIdentifier).toBe("com.elroybenjamins.risingguildmaster");
  });

  it("ships the production Android AdMob application ID", () => {
    const plugin = app.plugins.find((entry) => entry[0] === "react-native-google-mobile-ads");
    const options = plugin?.[1] as { androidAppId?: string } | undefined;
    expect(options?.androidAppId).toBe("ca-app-pub-2222059903000796~6020835595");
    expect(options?.androidAppId).not.toContain("3940256099942544");
  });
});
