import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: 'Citaciones',
        headerLeft: () => <DrawerToggleButton />
      }} />
      
      <Stack.Screen name="details" options={{
        title: 'Citación',
      }} />
    </Stack>
  );
};
export default Layout;