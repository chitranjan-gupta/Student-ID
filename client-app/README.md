# Build locally

## On Gitpod Codespace

## Setup the environment

1. On gitpod codespace nodejs is installed using nvm (node version manager)
   > Everything will work fine but to build the application we need superuser privilege.
   > But on gitpod codespace nodejs does not have sudo privilege
   > So we have to first uninstall nodejs, npm and nvm and reinstall using sudo privilege
2. Run command `nvm ls` to get nodejs version installed
3. Deactivate the nodejs `nvm deactivate`
4. Uninstall the nodejs `nvm uninstall <version>`
   > Now nodejs is uninstalled
5. Now we reinstall nodejs with sudo privilege
6. `sudo curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
7. `sudo apt install nodejs`
8. `sudo npm install -g eas-cli`
9. `npm install -g sharp-cli`

## You may also need development tools to build native addons:

     sudo apt-get install gcc g++ make cmake build-essential

## To install the Yarn package manager, run:

    `sudo curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null`
    `echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
    `sudo apt-get update && sudo apt-get install yarn`

## Build App Bundle

Make .env file and add EXPO_PUBLIC_MEDIATOR_URL

1. `sudo eas login`
2. `sudo npx expo prebuild` optional
3. `sudo eas build:configure` optional
4. `sudo eas build --platform android` for remotely `sudo eas build --platform android --local` for locally

## Building the app

1. Download the bundletool from https://developer.android.com/tools/bundletool
2. `java -jar bundletool.jar build-apks --bundle=build.aab --output=test.apks`
   or You can build app the specific to connected device
3. `java -jar .\bundletool.jar build-apks --connected-device --bundle=build.aab --output=test.apks`

## Installing the app

1. `java -jar bundletool.jat install-apks --apks=test.apks`

## Debugging the app

1. `adb logcat | findstr "com.chitranjan"` or `adb logcat *:S ReactNative:V ReactNativeJS:V`

Sources:

1. https://docs.expo.dev/build/setup/
2. https://linuxize.com/post/how-to-install-node-js-on-ubuntu-22-04/
3. https://reactgo.com/nvm-uninstall-active-node-version/
4. https://github.com/nvm-sh/nvm/issues/298
5. https://github.com/expo/eas-cli/issues/1300
6. https://github.com/facebook/react-native/issues/33623
7. https://www.npmjs.com/package/react-native-config
8. https://github.com/nodesource/distributions
9. https://linuxconfig.org/how-to-run-jar-file-on-linux
