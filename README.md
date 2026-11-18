# Capital Quiz 🌍

A fast-paced geography quiz for Android, iOS, and web — guess the capital from a country name, or the country from its flag. Built with Expo, React Native, and NativeWind.

<p align="center">
  <img src="docs/screenshots/home.png" width="256" alt="Home screen — quick play, daily challenge, endless mode" />
  <img src="docs/screenshots/quiz.png" width="256" alt="Quiz screen — answer a capital and see instant feedback" />
  <img src="docs/screenshots/results.png" width="256" alt="Results screen — score, accuracy, and best streak" />
</p>

## Features

- **Two game modes** — Capital Quiz (country → capital) and Flag Quiz (flag → country)
- **Real flag images** — flags load from [flagcdn.com](https://flagcdn.com) and fall back to emoji when offline
- **Three difficulties** — Easy, Medium, and Hard change the number of answer choices per question (4 / 6 / 8)
- **Optional timer** — 10, 20, or 30 seconds per question, or play untimed, with a color-shifting countdown bar
- **Scoring, streaks & accuracy** — 10 points per correct answer with best-streak tracking, letter-badged answers, ✓/✗ reveal marks, and end-of-run stats
- **Personal bests** — best scores are saved on-device for each mode + difficulty + timer combination
- **Polished results** — animated accuracy ring, performance tiers, and haptic feedback on correct/wrong answers (mobile only)
- **Settings** — sound and haptics toggles, plus a reset for best scores, weak spots, and the daily streak
- **71 countries** — spanning six continents

## Tech stack

- [Expo](https://expo.dev) SDK 57 / React Native with [expo-router](https://docs.expo.dev/router/introduction/) file-based routing
- [NativeWind](https://www.nativewind.dev/) — Tailwind CSS styling for React Native, with light/dark design tokens
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) for cached flag images
- [lucide-react-native](https://lucide.dev) + [react-native-svg](https://github.com/software-mansion/react-native-svg) for icons and the accuracy ring
- [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) for answer feedback
- TypeScript with the React Compiler enabled

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (npm or yarn work too — delete the lockfile first if you switch), plus an Android emulator, iOS simulator, or the [Expo Go](https://expo.dev/go) app on your phone.

```bash
pnpm install
pnpm start
```

Then scan the QR code with Expo Go, or press `a` / `i` in the terminal to launch on an Android emulator / iOS simulator. For web:

```bash
pnpm web
```

### Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start the Metro dev server |
| `pnpm android` | Run on a connected Android device/emulator (dev build) |
| `pnpm ios` | Run on an iOS simulator (dev build) |
| `pnpm web` | Start in web mode |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run Jest unit tests |

## Project structure

```
src/
├── app/          # Screens, routed by expo-router (index, quiz, results)
├── components/   # Reusable UI (answer option, flag, segmented control,
│                 #   progress dots, timer bar, accuracy ring)
├── data/         # Country dataset (name, capital, flag, continent)
├── lib/          # Quiz logic (question generation, scoring) + shared
│                 #   theme tokens for icons/SVG
└── store/        # Best-scores context persisted with AsyncStorage
```

## Contributing

Issues and pull requests are welcome! For larger changes, please open an issue first to discuss what you'd like to change.

## License

Released under the [MIT License](LICENSE).
