import DrawerContent from "components/drawerContent";
import { Drawer } from "expo-router/drawer";
const Layout = () => {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="(notices)" options={{ headerShown: false, title: 'Avisos' }} />
      <Drawer.Screen name="(licences)" options={{ headerShown: false, title: 'Licencias' }} />
      <Drawer.Screen name="attendances" options={{ headerShown: true, title: 'Asistencias' }} />
    </Drawer>
  );
}
export default Layout;