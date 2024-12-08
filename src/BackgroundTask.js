import BackgroundFetch from 'react-native-background-fetch';
import { InvokeSocket } from './shared/services/service';

export default async (taskData) => {

  InvokeSocket()

  BackgroundFetch.finish(taskData.taskId);
};
