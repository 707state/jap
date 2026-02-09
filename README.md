# Build
debug build
```bash
pnpm build
pnpm exec expo run:android
```

release
```bash
pnpm exec expo prebuild
cd android
./gradlew assembleRelease
```
