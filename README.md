⏱️ Timer Management App - React Native
Welcome to the Timer Management App built with React Native! This app allows users to create, manage, and track timers with ease. It supports multiple categories, dark mode, and persistent storage using AsyncStorage.

🚀 Getting Started
Follow these steps to set up and run the app on your local machine.

Prerequisites
Ensure you have completed the React Native Environment Setup guide up to the "Creating a new application" step.

Step 1: Start the Metro Server
Start Metro, the JavaScript bundler for React Native, by running the following command from the root of your project:

bash
Copy
# Using npm
npm start

# OR using Yarn
yarn start
Step 2: Start Your Application
Once Metro is running, open a new terminal and start your app on an Android or iOS emulator/simulator:

For Android
bash
Copy
# Using npm
npm run android

# OR using Yarn
yarn android
For iOS
bash
Copy
# Using npm
npm run ios

# OR using Yarn
yarn ios
If everything is set up correctly, your app should launch in the emulator/simulator shortly.

Step 3: Modify Your App
Now that the app is running, you can start making changes:

Open App.tsx in your preferred text editor.

Make your desired changes.

Reload the app to see the updates:

Android: Press R twice or use the Developer Menu (Ctrl + M on Windows/Linux or Cmd + M on macOS).

iOS: Press Cmd + R in the simulator.

🎉 Congratulations!
You’ve successfully set up and modified your React Native app! 🎉

🛠️ Features and Assumptions
📚 Data Persistence
Timers and history are stored locally using AsyncStorage.

No backend or cloud storage is involved. Data is not synced across devices.

⏱️ Timer Management
Timers are managed using setInterval with 1000ms intervals.

Timer precision is not guaranteed to be millisecond-perfect.

🕹️ User Interaction
Users can add, edit, start, pause, reset, and delete timers.

Bulk actions (Start, Pause, Reset) apply to all timers within a selected category.

🗂️ Category Management
Predefined categories: Workout, Study, Break, Others.

Custom categories can be added under the "Others" option.

Categories cannot be edited or deleted once created.

🌙 Dark Mode Support
Light and dark themes are supported.

User preferences are persisted using AsyncStorage.

⚠️ Validation and Alerts
Basic form validation ensures required fields (name, duration, category) are filled.

Alert dialogs notify users of missing fields.

Halfway alerts notify users at 50% of the timer duration (if enabled).

🎉 Timer Completion
Timers automatically stop and mark as “Completed” when the time reaches zero.

A congratulatory modal is shown upon completion.

Completed timers are logged to history and saved in AsyncStorage.

📊 Progress Visualization
A progress bar visually indicates the percentage of timer completion.

Completed timers display a “Completed” message.

🛠️ State Management
useState is used for managing app state (timers, categories, preferences).

State updates are persisted in AsyncStorage.

📑 History Management
Completed timers are logged with their name and completion time.

History is displayed on a separate HistoryScreen.

Timer history cannot be modified or deleted.

📦 Error Handling
Basic error handling is implemented for loading and saving timer data.

Unexpected errors during AsyncStorage operations are logged to the console.

📝 Timer Export (Optional Enhancement)
Future feature: Export timer data as a JSON file.

No encryption or advanced formatting is applied during export.

🔔 Halfway Alert
The halfway alert is triggered exactly at 50% of the timer duration.

Alerts are displayed as on-screen messages (not push notifications).

🛠️ Troubleshooting
If you encounter issues, refer to the React Native Troubleshooting Guide.

📚 Learn More
Explore these resources to dive deeper into React Native:

React Native Website

Getting Started Guide

Learn the Basics

React Native Blog

GitHub Repository

🎨 Design Philosophy
Simplicity: The app is designed to be intuitive and easy to use.

Persistence: All data is stored locally for offline access.

Customization: Users can create custom categories and enable/disable features like halfway alerts.

🚀 Future Enhancements
Add push notifications for timer alerts.

Implement cloud sync for cross-device data access.

Introduce advanced analytics for timer usage.

🙌 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
