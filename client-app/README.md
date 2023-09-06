# Build locally
## On Github Codespace
1. On github codespace nodejs is installed using nvm (node version manager)
    > Everything will work fine but to build the application we need superuser privilege.
    > But on github codespace nodejs does not have sudo privilege
    > So we have to first uninstall nodejs, npm and nvm and reinstall using sudo privilege
2. Run command `nvm ls` to get nodejs version installed 
3. Deactivate the nodejs `nvm deactivate`
4. Uninstall the nodejs `nvm uninstall <version>`
    > Now nodejs is uninstalled 
5. Now we reinstall nodejs with sudo privilege
6. `sudo curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
7. `sudo apt install nodejs`
8. `sudo apt install build-essential`
9. `sudo npm install -g eas-cli`
10. `sudo eas login`
11. `sudo npx expo prebuild`
11. `sudo eas build:configure` optional
12. `sudo eas build --platform android` for remotely `eas build --platform android --local` for locally

sources:
1. https://docs.expo.dev/build/setup/
2. https://linuxize.com/post/how-to-install-node-js-on-ubuntu-22-04/
3. https://reactgo.com/nvm-uninstall-active-node-version/
4. https://github.com/nvm-sh/nvm/issues/298
5. https://github.com/expo/eas-cli/issues/1300
6. https://github.com/facebook/react-native/issues/33623
7. https://www.npmjs.com/package/react-native-config