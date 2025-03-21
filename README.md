
⏱️ Timer Management App - React Native
This is a new React Native project, bootstrapped using @react-native-community/cli.

📚 Getting Started
Note: Make sure you have completed the React Native - Environment Setup instructions till "Creating a new application" step, before proceeding.

Step 1: Start the Metro Server
First, you will need to start Metro, the JavaScript bundler that ships with React Native.

To start Metro, run the following command from the root of your React Native project:

bash
Copy
Edit
# using npm
npm start

# OR using Yarn
yarn start
Step 2: Start your Application
Let Metro Bundler run in its own terminal. Open a new terminal from the root of your React Native project. Run the following command to start your Android or iOS app:

For Android
bash
Copy
Edit
# using npm
npm run android

# OR using Yarn
yarn android
For iOS
bash
Copy
Edit
# using npm
npm run ios

# OR using Yarn
yarn ios
If everything is set up correctly, you should see your new app running in your Android Emulator or iOS Simulator shortly, provided you have set up your emulator/simulator correctly.

You can also run the app directly from within Android Studio or Xcode.

Step 3: Modifying your App
Now that you have successfully run the app, let's modify it.

Open App.tsx in your text editor of choice and edit some lines.

For Android: Press the <kbd>R</kbd> key twice or select "Reload" from the Developer Menu (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Windows and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

For iOS: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

🎉 Congratulations! :tada:
You've successfully run and modified your React Native App. :partying_face:

Now what?
If you want to add this new React Native code to an existing application, check out the Integration guide.
If you're curious to learn more about React Native, check out the Introduction to React Native.
⚡ Troubleshooting
If you can't get this to work, see the Troubleshooting page.

📚 Learn More
To learn more about React Native, take a look at the following resources:

React Native Website - learn more about React Native.
Getting Started - an overview of React Native and how to set up your environment.
Learn the Basics - a guided tour of the React Native basics.
Blog - read the latest official React Native Blog posts.
@facebook/react-native - the Open Source GitHub repository for React Native.
📄 Assumptions Made During Development
📚 Data Persistence
Timers and history are stored locally using AsyncStorage for persistence.
No backend or cloud storage is involved, and data will not be synced across devices.
⏱️ Timer Management
Timers are managed using setInterval with 1000ms intervals.
Timer precision is not guaranteed to be millisecond-perfect, and slight deviations may occur.
🕹️ User Interaction
Users can add, edit, start, pause, reset, and delete timers.
Bulk actions (Start, Pause, Reset) apply to all timers within a selected category.
🕹️ Category Management
Predefined categories (Workout, Study, Break, Others) are available.
Custom categories can be added using the Others option with a custom name.
Categories cannot be edited or deleted once created.
🎨 Dark Mode Support
Light and dark themes are supported, with the user’s choice persisted using AsyncStorage.
Theme state is restored when the app is reopened.
⚠️ Validation and Alerts
Basic form validation ensures that a timer cannot be created without a name, duration, or category.
Alert dialogs inform the user when required fields are missing.
Halfway alerts notify the user at 50% of the total duration if enabled.
🎉 Timer Completion
Timers automatically stop and mark as “Completed” when the remaining time reaches zero.
A congratulatory modal is shown upon completion, and completed timers are logged to history.
Completed timers are saved in AsyncStorage for viewing in the HistoryScreen.
📊 Progress Visualization
A progress bar visually indicates the percentage of timer completion.
Completed timers show a “Completed” message instead of remaining time.
🛠️ State Management
useState is used for managing app state, including timers, categories, and user preferences.
State updates are persisted in AsyncStorage to maintain consistency after app restarts.
📑 History Management
Completed timers are logged with name and completion time.
History is displayed on a separate HistoryScreen.
Timer history cannot be modified or deleted once stored.
📦 Error Handling
Basic error handling is implemented for loading and saving timer data.
Unexpected errors during AsyncStorage operations are logged to the console.
📝 Timer Export (Optional Enhancement)
Export functionality is assumed to be a future feature and will export data as a JSON file.
No encryption or advanced formatting is applied during data export.
🔔 Halfway Alert
The halfway alert is triggered exactly at 50% of the timer duration.
Alerts are displayed as on-screen messages, not as push notifications.
