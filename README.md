# OxBIGChallenge - Food Recommender App 🍎🥗

OxBIGChallenge is a personalized food recommender app that helps you make healthier dietary choices. Log your meals and get customized nutritional recommendations based on the foods you’ve eaten. Whether you aim to balance macros, improve energy, or focus on specific nutrients, OxBIGChallenge is designed to support your goals!
Features

    Food Logging: Track daily meals and snack choices.
    Tailored Recommendations: Get personalized tips based on the nutritional profiles of your food logs.
    Health Insights: Receive actionable feedback on dietary patterns.
    Customizable Goals: Set your own nutrition preferences to tailor recommendations.

## Project Structure

OxBIGChallenge
├── InputAndRecommendationView
│   ├── App.tsx                # Main app file
│   ├── contexts               # React Contexts for global state
│   ├── screens                # Screen components for views
│   ├── android                # Android-specific code and settings
│   ├── ios                    # iOS-specific code and settings
│   ├── __tests__              # Test files
│   ├── app.json               # App configuration
│   ├── babel.config.js        # Babel config
│   ├── jest.config.js         # Jest config
│   ├── metro.config.js        # Metro bundler config
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript config
│   ├── index.js               # Entry point
│   └── README.md              # Project documentation
└── README.md                  # Root README

## Prerequisites

    Node.js and Watchman: Install Node.js and Watchman.
        Node.js installation guide
        Watchman installation guide

    React Native CLI: Install the React Native CLI globally.

    npm install -g react-native-cli

    Xcode (for iOS): If you're developing for iOS, ensure you have Xcode installed from the App Store and configured correctly.

    Android Studio (for Android): If you're developing for Android, install Android Studio and set up an Android Virtual Device (AVD) or enable USB debugging on your device.

    ## Installation

    Clone the repository:

git clone https://github.com/yourusername/OxBIGChallenge.git
cd OxBIGChallenge/InputAndRecommendationView

Install dependencies:

    npm install

Running the App

    Start Metro Bundler:

    In your project directory, run:

npx react-native start

Run on Android:

With an Android emulator running or a physical device connected:

npx react-native run-android

Run on iOS:

With an iOS simulator or a connected device:

    npx react-native run-ios

    ## Usage

    Log Foods: Use the app to log meals from the food database or add custom items.
    Receive Recommendations: View personalized suggestions that align with your nutritional needs.
    Track Progress: Follow your daily intake and receive feedback on how to meet your goals.

    ## Technologies Used

    React Native: Frontend framework for a cross-platform mobile experience
    On Demand: LLM Agent Orchestration API
