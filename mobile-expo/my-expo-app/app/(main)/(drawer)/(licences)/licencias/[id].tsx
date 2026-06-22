import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { AuthService } from 'services/auth';

type LeaveDetail = {
  id: number;
  title: string;
  message: string;
  reason: string;
  startDate?: string | null;
  endDate?: string | null;
  requestDate: string;
  status: string;
  active: boolean;
  rejectionReason?: string | null;
  student: {
    id: number;
    user: { firstName: string; lastName: string; email?: string };
    courseParallel?: { course?: { name: string }; parallel?: { name: string } } | null;
  };
  tutor: { id: number; firstName: string; lastName: string } | null;
  counts?: { approvedCount: number; pendingCount: number; rejectedCount: number };
};

const Page = () => {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<LeaveDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const token = await AuthService.getToken();
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/leaverequest/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setLeave(data);
      } catch (err) {
        console.error('Failed to load leave request details', err);
        setLeave(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No especificada';

  const statusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981'; // green
      case 'REJECTED':
        return '#EF4444'; // red
      case 'PENDING':
      default:
        return '#F59E0B'; // amber
    }
  };

  const statusLabel = (s?: string) => {
    if (s === 'PENDING') return 'Pendiente de aprobación';
    if (s === 'APPROVED') return 'Aprobado';
    if (s === 'REJECTED') return 'Rechazado';
    return s || 'Desconocido';
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
      </View>
    );
  }

  if (!leave) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-center text-red-500">Error al cargar los datos de la solicitud</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="space-y-4 p-4">
        {/* Header - Status Bar + Title */}
        <View className="flex-row items-start gap-3 rounded-lg bg-white p-4">
          <View
            style={{
              width: 6,
              height: 60,
              backgroundColor: statusColor(leave.status),
              borderRadius: 4,
            }}
          />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{leave.title}</Text>
            <Text
              style={{ color: statusColor(leave.status) }}
              className="mt-1 text-sm font-semibold">
              {statusLabel(leave.status)}
            </Text>
          </View>
        </View>

        {/* Summary Section */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-3 text-base font-semibold text-gray-800">Resumen</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Solicitado:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatDate(leave.requestDate)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Inicio:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatDate(leave.startDate)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Fin:</Text>
              <Text className="text-sm font-medium text-gray-900">{formatDate(leave.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Student Section */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-3 text-base font-semibold text-gray-800">Estudiante</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Nombre:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {leave.student.user.firstName} {leave.student.user.lastName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Curso:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {leave.student.courseParallel?.course?.name || 'No asignado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tutor Section */}
        {leave.tutor && (
          <View className="rounded-lg bg-white p-4">
            <Text className="mb-3 text-base font-semibold text-gray-800">Tutor</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Nombre:</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {leave.tutor.firstName} {leave.tutor.lastName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Details Section */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-3 text-base font-semibold text-gray-800">Detalles</Text>
          <View className="mb-3 rounded bg-gray-50 p-3">
            <Text className="mb-1 text-xs font-semibold text-gray-600">Mensaje:</Text>
            <Text className="text-sm text-gray-800">{leave.message}</Text>
          </View>
          <View className="rounded bg-gray-50 p-3">
            <Text className="mb-1 text-xs font-semibold text-gray-600">Motivo:</Text>
            <Text className="text-sm text-gray-800">{leave.reason}</Text>
          </View>
          {leave.status === 'REJECTED' && leave.rejectionReason && (
            <View className="mt-3 rounded bg-red-50 p-3">
              <Text className="mb-1 text-xs font-semibold text-red-600">Razón de rechazo:</Text>
              <Text className="text-sm text-red-700">{leave.rejectionReason}</Text>
            </View>
          )}
        </View>

        {/* Counts Section */}
        {leave.counts && (
          <View className="rounded-lg bg-white p-4">
            <Text className="mb-3 text-base font-semibold text-gray-800">
              Historial de Licencias
            </Text>
            <View className="flex-row justify-between gap-2">
              <View className="flex-1 items-center rounded bg-yellow-50 p-3">
                <Text className="text-xs font-semibold text-yellow-600">Pendientes</Text>
                <Text className="mt-1 text-lg font-bold text-yellow-600">
                  {leave.counts.pendingCount}
                </Text>
              </View>
              <View className="flex-1 items-center rounded bg-green-50 p-3">
                <Text className="text-xs font-semibold text-green-600">Aprobadas</Text>
                <Text className="mt-1 text-lg font-bold text-green-600">
                  {leave.counts.approvedCount}
                </Text>
              </View>
              <View className="flex-1 items-center rounded bg-red-50 p-3">
                <Text className="text-xs font-semibold text-red-600">Rechazadas</Text>
                <Text className="mt-1 text-lg font-bold text-red-600">
                  {leave.counts.rejectedCount}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
export default Page;
