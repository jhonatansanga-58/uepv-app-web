import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: 'Tareas',
        headerLeft: () => <DrawerToggleButton />
      }} />
      
      <Stack.Screen name="details" options={{
        title: 'Tarea',
      }} />
    </Stack>
  );
};
export default Layout;