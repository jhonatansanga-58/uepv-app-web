import { DrawerToggleButton } from "@react-navigation/drawer";
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "constants/colors";

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerLeft: () =>
          <DrawerToggleButton />,
        headerLeftContainerStyle: {
          paddingLeft: 16
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[500]
      }}
    >
      <Tabs.Screen
        name="comunicados"
        options={{
          title: 'Comunicados',
          headerShown: false,
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="megaphone-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="tareas"
        options={{
          title: 'Tareas',
          headerShown: false,
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="book-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen name="citaciones" options={{
        title: 'Citaciones',
        headerShown: false,
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="alert-circle-outline" color={color} size={size} />
      }}
      />
    </Tabs>
  );
}
export default Layout;