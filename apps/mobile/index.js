/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {store} from './src/redux';
import {Provider} from 'react-redux';

LogBox.ignoreAllLogs();

const Sysavings = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Sysavings);
