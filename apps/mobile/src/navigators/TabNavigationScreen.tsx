import Categories from '../screens/main/categories';
import Deals from '../screens/main/deals';
import Home from '../screens/main/home';
import Notification from '../screens/main/profile/Notification';
import Flights from '../screens/main/flights';
import Setting from '../screens/main/settings';
import {Icons} from '../themes';
import {RootTabParamList} from '../types';

export interface TabNavigationScreenInterface {
  name: keyof RootTabParamList;
  component: React.FC;
  Icon: any;
  title: string;
}

export const TabNavigationScreen: TabNavigationScreenInterface[] = [
  {
    name: 'Home',
    component: Home,
    Icon: Icons.Home,
    title: 'Home',
  },

  // {
  //   name: 'Categories',
  //   component: Categories,
  //   Icon: Icons.category,
  //   title: 'Categories',
  // },
  {
    name: 'Deals',
    component: Deals,
    Icon: Icons.Deals,
    title: 'Deals',
  },
  {
    name: 'Notification',
    component: Notification,
    Icon: Icons.Notification,
    title: 'Notifications',
  },
  {
    name: 'Flights',
    component: Flights,
    Icon: null,
    title: 'Flights',
  },
  {
    name: 'Setting',
    component: Setting,
    Icon: Icons.setting,
    title: 'Setting',
  },
];
