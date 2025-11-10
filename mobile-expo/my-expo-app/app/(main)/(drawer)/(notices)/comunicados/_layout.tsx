import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: 'Comunicados',
        headerLeft: () => <DrawerToggleButton />
      }} />
      
      <Stack.Screen name="details" options={{
        title: 'Comunicado',
      }} />
    </Stack>
  );
};
export default Layout;