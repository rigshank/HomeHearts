# HomeHearts

HomeHearts is a Dallas-first housing assistance prototype. It helps renters compare the cost of staying versus moving, find resources for their situation, and prepare a checklist and next steps for contacting a provider.

## 1. Download and install

You need a Windows, macOS, or Linux computer with [Node.js 22.13 or newer](https://nodejs.org/en/download) and npm. Node.js 24 LTS is recommended. Node installers include npm. Open a new terminal after installation and check that both commands print a version:

```sh
node --version
npm --version
```

If you have [Git](https://git-scm.com/downloads), run:

```sh
git clone https://github.com/rigshank/HomeHearts.git
cd HomeHearts
npm ci
```

You can also [download the ZIP](https://github.com/rigshank/HomeHearts/archive/refs/heads/main.zip), extract it, open a terminal in the extracted folder that contains `package.json`, and run `npm ci`.

HomeHearts runs with its bundled catalog and local storage. You can skip `.env` setup and Supabase credentials. There is no HomeHearts login.

## 2. Open the app

### Browser preview

From the project folder, run:

```sh
npm run web
```

Open the HTTP address printed in the terminal. Keep the terminal running while you use the app. Press **Ctrl+C** to stop it. The browser preview supports the core flows. For phone dialing and native file preview, use a physical phone.

### Android phone with Expo Go

1. Install [Expo Go for SDK 58 on Android](https://expo.dev/go?sdkVersion=58&platform=android&device=true). The Expo Go client must support the same SDK as this project.
2. Connect the computer and phone to the same Wi-Fi network.
3. From the project folder, start the server:

   ```sh
   npx expo start --go --lan
   ```

4. Leave the terminal open. In Expo Go on the phone, choose **Scan QR code** and scan the code printed in the terminal. The terminal's `exp://` address opens in Expo Go. Use the browser command above for the HTTP preview.

### iPhone or iPad with Expo Go

The App Store build of Expo Go supports SDK 54. This project uses SDK 58. On a physical iPhone or iPad, use an SDK 58 Expo Go build distributed through TestFlight. Creating that build requires an Apple Developer Program membership. If you lack a compatible build, use the browser preview or, on a Mac, the iOS Simulator. [Expo's iOS device setup](https://docs.expo.dev/get-started/set-up-your-environment/?device=physical&mode=expo-go&platform=ios)

Once the compatible app is installed, run `npx expo login` on the computer and sign in to the same Expo account in Expo Go. Connect both devices to the same Wi-Fi network, run `npx expo start --go --lan`, then scan the terminal QR code with the iPhone Camera app and open it in Expo Go.

For a simulator or emulator, follow Expo's [iOS Simulator setup](https://docs.expo.dev/workflow/ios-simulator/) or [Android Emulator setup](https://docs.expo.dev/workflow/android-studio-emulator/). Install the compatible Expo Go client, start the server, and press **i** for iOS or **a** for Android in the terminal.

## 3. Try the three main flows

1. **Compare costs.** From Home, choose **Compare costs**. Enter current rent, rent after the increase, upfront moving costs, and monthly rent after moving. Toggle between **3 months** and **12 months** to see how the totals change.
2. **Find assistance.** Choose **Find help now**, select **Rent went up** and **This week**, and enter `75201` as the ZIP code. Choose **Show my matches**, then open a result for its service area, intake status, eligibility, and official source. Results depend on the issue, ZIP code, and date. Use **Options for later** for closed programs and waitlists.
3. **Prepare and save a plan.** From that rent search, open **Dallas County Welfare Assistance** and scroll to **Prepare documents**. Add a sample PDF or image, then choose **View plan** to review your checklist. Use **Open call script** to see and copy the sample script. Use sample files for the demo and stop before calling a real provider.

## Troubleshooting

- **npm can't find package.json.** Open the extracted or cloned project folder that contains both `package.json` and `package-lock.json`, then run `npm ci` again.
- **The phone can't connect.** Check that both devices are on the same Wi-Fi network. Allow Expo Go local-network access if prompted, and allow Node.js through your computer's firewall on trusted private networks. If campus or guest Wi-Fi blocks device-to-device traffic, stop Metro with **Ctrl+C**, run `npx expo start --go --tunnel`, and scan the new code. Follow any Expo sign-in prompt. [Expo connection help](https://docs.expo.dev/get-started/start-developing/)
- **Expo Go reports an SDK mismatch.** Install a client that supports SDK 58, then restart Metro and scan the new QR code. Use the browser preview if a compatible phone client is unavailable. [Expo version mismatch guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- **The app looks stale or loads a blank screen.** Stop the old server with **Ctrl+C**. For a phone, run `npx expo start --go --lan --clear` and scan the new code. For a browser, run `npm run web -- --clear` and open the address from that terminal.

## Data and document handling

Matches use a bundled catalog with provider links and checked dates. Confirm current intake and eligibility with the provider. ZIP-based service areas are approximations based on [U.S. Census relationship files](https://www.census.gov/geographies/reference-files/2020/geo/relationship-files.html). The app offers a 211 directory when you need more options.

The default setup saves plan progress locally. Files picked for the checklist are staged in the app cache for the current session. HomeHearts does not submit an application or send those files to a provider. `.env.example` describes the optional Supabase configuration for developers.

## Developer checks

Run these from the project folder after `npm ci`:

```sh
npm run typecheck
npm run test:unit
npx expo export --platform web
```

The export writes the web build to `dist/`. App screens live in `app/`, with matching, cost, and plan logic in `src/domain/` and the bundled catalog in `src/data/`.
