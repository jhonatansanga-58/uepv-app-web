import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { colors } from 'constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from 'types/notices';
import { useState, useCallback, useEffect } from 'react';
import { AuthService } from 'services/auth';
import { router } from 'expo-router';

export default function NoticesScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log(await AuthService.getToken());
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/notices/notifications`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
        {notifications.length === 0 ? (
          <View className="bg-white rounded-lg p-4 items-center justify-center shadow-sm">
            <Ionicons name="notifications-off-outline" size={48} color={colors.gray[500]} />
            <Text className="mt-2 text-gray-500">No hay comunicados nuevos</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                className={'bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary-500'}
                onPress={() => {
                  router.push({
                    pathname: '/(main)/(drawer)/(notices)/comunicados/details',
                    params: {
                      title: notification.title,
                      message: notification.message,
                      date: notification.date,
                      creatorFirstName: notification.creator.firstName,
                      creatorLastName: notification.creator.lastName
                    }
                  });
                }}
              >
                <Text className="text-lg font-medium text-gray-900">{notification.title}</Text>
                <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>{notification.message}</Text>
                <View className="flex-row justify-end items-center mt-2">
                  <Text className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}