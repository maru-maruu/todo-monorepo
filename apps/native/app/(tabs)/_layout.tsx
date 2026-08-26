import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/BottomTabBar';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index]?.name;
        const tabMap: Record<string, 'tasks' | 'recurring' | 'settings'> = {
          index: 'tasks',
          recurring: 'recurring',
          settings: 'settings',
        };
        const activeTab = tabMap[activeRoute] ?? 'tasks';

        return (
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={(tab) => {
              const routeMap = {
                tasks: 'index',
                recurring: 'recurring',
                settings: 'settings',
              } as const;
              props.navigation.navigate(routeMap[tab]);
            }}
          />
        );
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="recurring" options={{ title: 'Recurring' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
