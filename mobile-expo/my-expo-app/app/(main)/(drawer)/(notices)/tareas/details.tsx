import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';

export default function TaskDetails() {
  const { title, description, sendDate, dueDate, subjectName, courseName, parallelName } =
    useLocalSearchParams();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <View className="flex-row items-center space-x-3">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          </View>

          <View className="space-y-2 text-sm text-gray-600">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="book" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">{subjectName ?? 'Sin materia'}</Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <Ionicons name="people" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">
                  {courseName} {parallelName ? `- ${parallelName}` : ''}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="square-outline" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">
                  Enviado: {sendDate ? new Date(sendDate as string).toLocaleString() : '-'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="calendar" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">
                  Vence: {dueDate ? new Date(dueDate as string).toLocaleString() : '-'}
                </Text>
              </View>
            </View>
          </View>

          <View className="pt-2">
            <Text className="text-base leading-relaxed text-gray-800">{description}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
