const { withAndroidManifest } = require("@expo/config-plugins");

function withTTSQueries(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    // Ensure <queries> exists as an array (xml2js structure)
    if (!Array.isArray(manifest.queries)) {
      manifest.queries = [];
    }
    if (manifest.queries.length === 0) {
      manifest.queries.push({});
    }

    const queries = manifest.queries[0];

    // 1) Add <queries><intent><action android:name="android.intent.action.TTS_SERVICE"/></intent></queries>
    if (!Array.isArray(queries.intent)) {
      queries.intent = [];
    }

    const hasTtsIntent = queries.intent.some((it) => {
      const name = it?.action?.[0]?.$?.["android:name"];
      return name === "android.intent.action.TTS_SERVICE";
    });

    if (!hasTtsIntent) {
      queries.intent.push({
        action: [{ $: { "android:name": "android.intent.action.TTS_SERVICE" } }],
      });
    }

    // 2) Add <queries><package android:name="com.google.android.tts"/></queries>
    if (!Array.isArray(queries.package)) {
      queries.package = [];
    }

    const hasGoogleTtsPkg = queries.package.some(
      (p) => p?.$?.["android:name"] === "com.google.android.tts"
    );

    if (!hasGoogleTtsPkg) {
      queries.package.push({
        $: { "android:name": "com.google.android.tts" },
      });
    }

    return mod;
  });
}

module.exports = withTTSQueries;

