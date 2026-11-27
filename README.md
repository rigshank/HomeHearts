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

1. **Compare costs.** From Home, choose **Compare costs**. Enter current rent, rent after the increase, upfront moving costs, and monthly rent after moving. Toggle between **3 months** and **12 months** to see how the totals change. To estimate a new place, enter a ZIP code and bedroom count under **Planning a move?** and choose **Use as monthly cost after move** to fill in HUD's benchmark rent.
2. **Find assistance.** Choose **Find help now**, select **Rent went up** and **This week**, and enter `75201` as the ZIP code. Choose **Show my matches**, then open a result for its service area, intake status, eligibility, and official source. Results depend on the issue, ZIP code, and date. Use **Options for later** for closed programs and waitlists.
3. **Prepare and save a plan.** From that rent search, open **Dallas County Welfare Assistance** and scroll to **Prepare documents**. Add a sample PDF or image, then choose **View plan** to review your checklist. Use **Open call script** to see and copy the sample script. Use sample files for the demo and stop before calling a real provider.

To correct a search, choose **Edit answers** above Matches or **Edit location** to jump to the ZIP question. Existing answers remain filled in. In the questionnaire, **Previous question** returns one step without clearing answers; at the first edit question, **Back to matches** exits. Android hardware Back also moves through questions. Browser Back/Forward uses page history, and reopening or refreshing the current intake page retains its question and saved answers. Changing questions does not add a separate page to browser history.

## Optional task dates and calendar export

In **My plan**, choose **Date & calendar** on an incomplete task. Enter a real date as `YYYY-MM-DD`, then choose **Save task date** or **Export calendar file (.ics)**. The date stays saved locally after reopening the app. Initial dates are personal planning suggestions, not provider deadlines: Today/Tomorrow use those dates, This week suggests three days ahead, and Next week suggests seven days ahead. Older undated plans receive these suggestions once when reopened; review them. After-call tasks need a date chosen by you.

An exported event contains that task's title, provider name and next step, for 15 minutes at **9 a.m. in your calendar's local time**. It does not include attached files, filenames or your intake answers. Choose a calendar whose sharing/privacy settings you are comfortable with. The optional **Request a 9 a.m. calendar alert** checkbox is off by default; alerts for a time already passed are rejected.

**Browser:** export requests a local `.ics` download. Open/import it with a compatible calendar app or its import command. Browser download restrictions and calendar import support vary. **Android/iOS:** HomeHearts attempts to open the file with the system viewer/compatible app; a viewer may not support calendar import. If no compatible app/import is available, use the browser download or create the event manually. No calendar/account access or notification permission is requested by HomeHearts, and no new native module is required.

**Importing and alerts are your calendar's responsibility.** Review/confirm the event and alert there; some apps ignore imported alarms, and calendar/OS notification settings can prevent alerts. Export success means only that a file download/open was requested, not that an event or alert was scheduled. HomeHearts sends no notifications and cannot confirm an import.

**Changes do not sync.** After changing a task date, completing or skipping a task, edit/delete its old event and alert in your calendar. Export the new date if needed, deleting the old event first because repeated imports can create duplicates. The plan displays the last exported file date and flags date changes or completed/skipped tasks. Closing export options creates no calendar file or alert. Temporary native export files are held in the app cache.

## Troubleshooting

- **npm can't find package.json.** Open the extracted or cloned project folder that contains both `package.json` and `package-lock.json`, then run `npm ci` again.
- **The phone can't connect.** Check that both devices are on the same Wi-Fi network. Allow Expo Go local-network access if prompted, and allow Node.js through your computer's firewall on trusted private networks. If campus or guest Wi-Fi blocks device-to-device traffic, stop Metro with **Ctrl+C**, run `npx expo start --go --tunnel`, and scan the new code. Follow any Expo sign-in prompt. [Expo connection help](https://docs.expo.dev/get-started/start-developing/)
- **Expo Go reports an SDK mismatch.** Install a client that supports SDK 58, then restart Metro and scan the new QR code. Use the browser preview if a compatible phone client is unavailable. [Expo version mismatch guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- **The app looks stale or loads a blank screen.** Stop the old server with **Ctrl+C**. For a phone, run `npx expo start --go --lan --clear` and scan the new code. For a browser, run `npm run web -- --clear` and open the address from that terminal.

## Data and document handling

Matches come from a catalog of programs with provider links and checked dates, curated from the official provider websites. The app downloads the latest catalog (`src/data/catalog.json` on this repository's `main` branch) when it opens and falls back to a saved or bundled copy when offline. The Matches screen shows which copy you are seeing, with a **Refresh** button. Confirm current intake and eligibility with the provider.

The cost comparison's rent lookup uses [HUD's FY2027 Small Area Fair Market Rents](https://www.huduser.gov/portal/datasets/fmr.html) for Texas ZIP codes, stored in `src/data/hudRents.json`. HUD uses these figures as a benchmark for housing vouchers, so they are a reference point, not an average of current listings. `python3 scripts/build-hud-rents.py <HUD workbook>.xlsx` regenerates the file when HUD publishes a new year.

ZIP-based service areas are approximations based on [U.S. Census relationship files](https://www.census.gov/geographies/reference-files/2020/geo/relationship-files.html). The app offers a 211 directory when you need more options.

The default setup saves plan progress locally. Files picked for the checklist are staged in the app cache for the current session. HomeHearts does not submit an application or send those files to a provider. `.env.example` describes the optional Supabase configuration for developers.

## Developer checks

Run these from the project folder after `npm ci`:

```sh
npm run typecheck
npm run test:unit
npx expo export --platform web
```

The export writes the web build to `dist/`. App screens live in `app/`, with matching, cost, and plan logic in `src/domain/` and the bundled catalog in `src/data/`.
