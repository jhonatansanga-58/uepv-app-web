import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';

export default function NotificationDetails() {
  const { title, message, date, creatorFirstName, creatorLastName } = useLocalSearchParams();

  return (
    <View className="p-4">
      <View className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <View className="flex-row items-center space-x-3">
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        </View>

        <View className="border-b border-t border-gray-200 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="person" size={16} color={colors.gray[500]} />
              <Text className="text-sm text-gray-600">
                {creatorFirstName} {creatorLastName}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="calendar" size={16} color={colors.gray[500]} />
              <Text className="text-sm text-gray-600">
                {new Date(date as string).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className="space-y-2">
          <Text className="text-base leading-relaxed text-gray-800">{message}</Text>
        </View>
      </View>
    </View>
  );
}
