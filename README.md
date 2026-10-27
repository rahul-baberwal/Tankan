# Tankan (टंकण)

Free typing test practice for Indian government exams (SSC CHSL/CGL/DEO, RRB NTPC, Supreme Court JCA, High Courts, CPCT, police, KVS, CRPF, Rajasthan Patwari) in English and Hindi.

Created by [Rahul Baberwal](https://rahulbaberwal.com)

One codebase, plain HTML/CSS/JavaScript in `www/`. No build step, no libraries.

| Target | How |
|---|---|
| Browser / PWA | Open `www/index.html` (double-click works, fully offline) |
| Windows `.msi` + `.exe` | Tauri wrapper in `src-tauri/` (see below) |
| Android `.apk` | Capacitor wrapper, same `www/` folder (see below) |

## Windows installers (.msi and .exe)

Windows installers must be built on Windows. Two ways:

**A. GitHub Actions (no setup on your PC)**
1. Create a GitHub repo and push this folder.
2. Open the Actions tab, run **Build Windows installers** (or push a tag like `v1.0.0`).
3. Download the `Tankan-msi` and `Tankan-exe` artifacts (tagged builds also attach them to a Release).

**B. On your own Windows PC**
Install Node.js 20+, Rust (rustup.rs) and Visual Studio Build Tools ("Desktop development with C++"), then run `build-windows.bat`.
Output: `src-tauri\target\release\bundle\msi\` and `...\nsis\`.

Windows may show a SmartScreen warning for an unsigned installer. That is normal until you buy a code-signing certificate.

## Android

```
npm install
npx cap add android
npx cap sync android
npx cap open android      # builds the APK in Android Studio
```
The app is built for a physical keyboard. Phones work for reading results, the game and lessons, but real exams are typed on a keyboard.

## Tests

`npm test` runs the scoring engine tests (13 cases: full/half mistakes, skipped and extra words, partial last word, Hindi, DEST pass rule, speed).

## How scoring works

Typed words are aligned with the passage (word-level edit distance, untouched tail of the passage is free).
- Wrong, extra or skipped word: 1 full mistake
- Same word differing only in case or punctuation: half mistake
- Net WPM = (characters / 5 − full − half / 2) / minutes
- Data-entry tests: key depressions per hour = key presses / minutes × 60
- A word you were halfway through when time ended is not a mistake

## Where to change things

- `www/js/data.js`: exam presets (duration, speed, error %, backspace rule), passages, lessons
- `www/js/engine.js`: scoring
- `www/css/style.css`: all colours are variables at the top

## Honest limits

- Presets come from public notices as reported by typinghub.in, typingtest.indgovtjobs.net and prep sites (Oct 2026). Sources disagree on some error limits. Check your own notice; every value is editable on the set-up screen.
- Hindi is Unicode and follows your operating-system keyboard (Windows: Win + Space, Hindi InScript). Kruti Dev and Remington layouts need their own input tool and are not built in.
- Passages are original, not copied from previous-year papers.
- Certificates are for practice only and say so.
- Tankan is not affiliated with SSC, RRB or any government body.

## Author

Created by [Rahul Baberwal](https://rahulbaberwal.com).

