import { Link } from "expo-router";
import { View, Text } from "react-native";

const Index = () => {
  return (
    <View>
      <Link href='(drawer)/(licences)/licencias/1'>
        <Text>
          Licencia 1
        </Text>
      </Link>
      <Link href='(drawer)/(licences)/licencias/2'>
        <Text>
          Licencia 2
        </Text>
      </Link>
      <Link href='(drawer)/(licences)/licencias/3'>
        <Text>
          Licencia 3
        </Text>
      </Link>
    </View>
  );
}
export default Index;