import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { colors } from 'constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Meeting } from 'types/notices';
import { useState, useCallback, useEffect } from 'react';
import { AuthService } from 'services/auth';
import { router } from 'expo-router';

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/notices/meetings`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {meetings.length === 0 ? (
          <View className="bg-white rounded-lg p-4 items-center justify-center shadow-sm">
            <Ionicons name="clipboard-outline" size={48} color={colors.gray[500]} />
            <Text className="mt-2 text-gray-500">No hay citaciones disponibles</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {meetings.map((m) => (
              <TouchableOpacity
                key={m.id}
                className={'bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary-500'}
                onPress={() => {
                  router.push({
                    pathname: '/(main)/(drawer)/(notices)/citaciones/details',
                    params: {
                      topic: m.topic,
                      message: m.message,
                      date: m.date,
                      authorFirstName: m.user?.firstName ?? '',
                      authorLastName: m.user?.lastName ?? '',
                      studentFirstName: m.student?.user?.firstName ?? '',
                      studentLastName: m.student?.user?.lastName ?? '',
                      courseName: m.student?.courseParallel?.course?.name ?? '',
                      parallelName: m.student?.courseParallel?.parallel?.name ?? ''
                    }
                  });
                }}
              >
                <View className="flex-row justify-between">
                  <Text className="text-lg font-medium text-gray-900" numberOfLines={1}>{m.topic}</Text>
                  <Text className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString()}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center space-x-2">
                    <View className="bg-primary-100 px-2 py-1 rounded">
                      <Text className="text-xs text-primary-700">{m.student?.courseParallel?.course?.name ?? ''} {m.student?.courseParallel?.parallel?.name ? `${m.student.courseParallel.parallel.name}` : ''}</Text>
                    </View>
                    <Text className="text-sm text-gray-600"> {m.student?.user ? `${m.student.user.firstName} ${m.student.user.lastName}` : ''}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">Por: {m.user?.firstName} {m.user?.lastName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}