/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./src/App";
import { name as appName } from "./app.json";
import BackgroundTask from "./src/BackgroundTask";
import BackgroundFetch from "react-native-background-fetch";
import { store } from "./src/shared/redux/store";
import { InvokeSocket } from "./src/shared/services/service";
import { register } from "@videosdk.live/react-native-sdk";

// Register the service
register();

// Your main background fetch configuration
BackgroundFetch.configure(
  {
    minimumFetchInterval: 5, // fetch interval in minutes
    stopOnTerminate: false, // true = task will terminate when app is killed
    startOnBoot: true, // true = task will start automatically after device reboot
    enableHeadless: true, // Enable background execution even when the app is killed
  },
  async (taskId) => {
    InvokeSocket();
    BackgroundFetch.finish(taskId);
  },
  (error) => {}
);

AppRegistry.registerComponent(appName, () => App);
// Register the headless task
AppRegistry.registerHeadlessTask("BackgroundFetch", () => BackgroundTask);
