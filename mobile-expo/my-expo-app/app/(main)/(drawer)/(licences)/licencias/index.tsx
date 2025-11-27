import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';
import { useState, useCallback } from 'react';
import { AuthService } from 'services/auth';
import { useFocusEffect, useRouter } from 'expo-router';

type LeaveRequest = {
  id: number;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  active: boolean;
  requestDate?: string;
  student?: {
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
};

export default function LeaveRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981'; // green-500
      case 'REJECTED':
        return '#EF4444'; // red-500
      case 'PENDING':
      default:
        return '#F59E0B'; // amber-500
    }
  };

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      if (!user?.id) return;
      const token = await AuthService.getToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/tutors/${user.id}/leaverequests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load leave requests', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleActive = async (id: number, current: boolean) => {
    const newValue = !current;
    // optimistic update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, active: newValue } : r));
    try {
      const token = await AuthService.getToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/leaverequest/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ active: newValue }),
      });
      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }
      const updated = await res.json();
      // replace with server value to keep in sync
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) {
      console.error('Failed to update leave request', err);
      // revert optimistic change
      setRequests(prev => prev.map(r => r.id === id ? { ...r, active: current } : r));
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={load} />
      }
    >
      <View className="p-4">

        {loading && requests.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator />
          </View>
        ) : requests.length === 0 ? (
          <View className="bg-white rounded-lg p-4 items-center justify-center shadow-sm">
            <Ionicons name="document-text-outline" size={48} color={colors.gray[500]} />
            <Text className="mt-2 text-gray-500">No hay solicitudes de licencia</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {requests.map((req) => (
              <TouchableOpacity
                key={req.id}
                className={'bg-white p-4 rounded-lg shadow-sm flex-row items-center'}
                activeOpacity={0.8}
                onPress={() => router.push(`(drawer)/(licences)/licencias/${req.id}`)}
              >
                <View style={{ width: 6, height: '100%', backgroundColor: statusColor(req.status), marginRight: 12, borderRadius: 4 }} />

                <View className="flex-1">
                  <Text className="text-lg font-medium text-gray-900">{req.title}</Text>
                  <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
                    {req.student?.user?.firstName} {req.student?.user?.lastName}
                  </Text>

                </View>
                <View className="ml-3 items-end justify-center">
                  {(req.status === 'PENDING') ? (
                    <Switch
                      value={!!req.active}
                      onValueChange={() => toggleActive(req.id, !!req.active)}
                    />
                  ) : (
                    <View className="h-8" />
                  )}
                  {req.requestDate && (
                    <Text className="text-xs text-gray-500 mt-1">{new Date(req.requestDate).toLocaleString()}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}