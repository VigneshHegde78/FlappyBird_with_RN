# 🐦 Flappy Bird Clone (React Native + Expo)

![Platform - Android](https://img.shields.io/badge/Platform-Android-green)
![Framework](https://img.shields.io/badge/Built%20With-React%20Native%20%7C%20Expo-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A mobile recreation of the classic Flappy Bird game, built using **React Native** and the **Expo SDK**. This project demonstrates game loop logic, collision detection, and local data persistence on Android devices.

> **📱 Compatibility Note:** This release is currently optimized and tested for **Android** only.

## 📸 Screenshots

| Start Screen | Gameplay | Game Over |
|:---:|:---:|:---:|
| <img src="./assets/ui/screenshot1.png" width="200" alt="Start Screen" /> | <img src="./assets/ui/screenshot2.png" width="200" alt="Gameplay" /> | <img src="./assets/ui/screenshot3.png" width="200" alt="Game Over" /> |

## ✨ Features

* **Physics Engine:** Smooth gravity simulation and jump mechanics.
* **Infinite Level:** Pipes generate randomly and infinitely as you progress.
* **Collision Detection:** Pixel-perfect detection between the bird, pipes, and the ground.
* **High Score System:** Uses `AsyncStorage` to save your best score locally on the device.
* **Audio:** Sound effects for jumping, scoring, and collisions.

## 📥 Download & Play (APK)

You don't need to run the code to play! You can download the Android App Bundle (APK) directly from the Releases page.

1.  Go to the [Latest Release](https://github.com/VigneshHegde78/FlappyBird_with_RN/releases) page.
2.  Download the `FlappyBird-v1.0.0.apk` file.
3.  Install it on your Android device.

## 🛠️ Tech Stack

* **Core:** React Native
* **Tooling:** Expo (SDK 50+)
* **State Management:** React Hooks (`useState`, `useEffect`)
* **Storage:** `@react-native-async-storage/async-storage`

## 🚀 Running Locally

If you want to view the source code or run it in development mode, follow these steps:

### Prerequisites
* Node.js installed.
* **Expo Go** app installed on your Android phone.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/VigneshHegde78/FlappyBird_with_RN.git](https://github.com/VigneshHegde78/FlappyBird_with_RN.git)
    cd YOUR-REPO-NAME
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npx expo start
    ```

4.  **Run on Android**
    * Scan the QR code appearing in the terminal using the **Expo Go** app on your Android phone.
    * OR press `a` in the terminal to run on an Android Emulator.

## 📂 Project Structure

```text
/assets          # Images (bird, pipes, background) and Sounds
/components      # Reusable UI components (Bird, Pipe, Score)
/utils           # Constants (Dimensions, Colors)
App.js           # Main Entry Point
app.json         # Expo Configuration
