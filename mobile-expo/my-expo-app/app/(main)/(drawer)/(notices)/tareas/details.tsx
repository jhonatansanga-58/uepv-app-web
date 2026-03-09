import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';

export default function TaskDetails() {
  const {
    title,
    description,
    sendDate,
    dueDate,
    subjectName,
    courseName,
    parallelName,
  } = useLocalSearchParams();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <View className="flex-row items-center space-x-3">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          </View>

          <View className="text-sm text-gray-600 space-y-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="book" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">{subjectName ?? 'Sin materia'}</Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <Ionicons name="people" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">{courseName} {parallelName ? `- ${parallelName}` : ''}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-2">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="square-outline" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">Enviado: {sendDate ? new Date(sendDate as string).toLocaleString() : '-'}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-2">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="calendar" size={14} color={colors.gray[500]} />
                <Text className="text-sm text-gray-600">Vence: {dueDate ? new Date(dueDate as string).toLocaleString() : '-'}</Text>
              </View>
            </View>
          </View>

          <View className="pt-2">
            <Text className="text-base text-gray-800 leading-relaxed">{description}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}