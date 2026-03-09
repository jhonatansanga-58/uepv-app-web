import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { colors } from 'constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Task } from 'types/notices';
import { useState, useCallback, useEffect } from 'react';
import { AuthService } from 'services/auth';
import { router } from 'expo-router';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/notices/tasks`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      setTasks(data);
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
        {tasks.length === 0 ? (
          <View className="bg-white rounded-lg p-4 items-center justify-center shadow-sm">
            <Ionicons name="clipboard-outline" size={48} color={colors.gray[500]} />
            <Text className="mt-2 text-gray-500">No hay tareas disponibles</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                className={'bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary-500'}
                onPress={() => {
                  router.push({
                    pathname: '/(main)/(drawer)/(notices)/tareas/details',
                    params: {
                      title: task.title,
                      description: task.description,
                      sendDate: task.sendDate,
                      dueDate: task.dueDate,
                      subjectName: task.subject?.name ?? '',
                      courseName: task.courseParallel?.course?.name ?? '',
                      parallelName: task.courseParallel?.parallel?.name ?? ''
                    }
                  });
                }}
              >
                <View className="flex-row justify-between">
                  <Text className="text-lg font-medium text-gray-900" numberOfLines={1}>{task.title}</Text>
                  <Text className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center space-x-2">
                    <View className="bg-primary-100 px-2 py-1 rounded">
                      <Text className="text-xs text-primary-700">{task.subject?.name ?? 'Sin materia'}</Text>
                    </View>
                    <Text className="text-sm text-gray-600">{task.courseParallel?.course?.name ?? ''} {task.courseParallel?.parallel?.name ? `- ${task.courseParallel.parallel.name}` : ''}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">{new Date(task.sendDate).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}