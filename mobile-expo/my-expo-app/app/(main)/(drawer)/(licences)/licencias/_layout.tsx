import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Licencias',
          headerLeft: () => <DrawerToggleButton />,
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalle de licencia',
        }}
      />
    </Stack>
  );
};
export default Layout;
