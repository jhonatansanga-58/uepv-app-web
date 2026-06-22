import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { AuthService } from 'services/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';

type StudentOption = {
  id: number;
  firstName: string;
  lastName: string;
  cardCode?: string;
  course: string;
  parallel: string;
};

type Attendance = {
  id: number;
  date: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export default function AttendancesScreen() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [filtered, setFiltered] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // load students once for the tutor, or set self if student
    (async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user?.id) return;

        setUserRole(user.role);

        if (user.role === 'STUDENT') {
          setSelectedStudent({
            id: user.id,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            course: '',
            parallel: '',
          });
          setStudents([]);
          setFiltered([]);
          return;
        }

        const token = await AuthService.getToken();
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/mobile/tutors/${user.id}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        const data = await res.json();
        // normalize items to StudentOption shape
        const items: StudentOption[] = data.map((s: any) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          cardCode: s.cardCode,
          course: s.course ?? s.courseParallel?.course?.name ?? '',
          parallel: s.parallel ?? s.courseParallel?.parallel?.name ?? '',
        }));
        setStudents(items);
        setFiltered(items);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    })();
  }, []);

  // filter as user types (simple client-side filter)
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(students);
      return;
    }
    const f = students.filter((s) => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      const course = `${s.course} ${s.parallel}`.toLowerCase();
      return name.includes(q) || course.includes(q) || (s.cardCode || '').toLowerCase().includes(q);
    });
    setFiltered(f);
  }, [query, students]);

  const fetchAttendances = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const token = await AuthService.getToken();
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/mobile/attendance?studentId=${selectedStudent.id}&from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      const data = await res.json();
      setAttendances(data);
    } catch (err) {
      console.error('Failed to fetch attendances', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: StudentOption }) => (
    <TouchableOpacity
      className="mb-2 rounded-lg bg-white p-3"
      onPress={() => {
        setSelectedStudent(item);
        setQuery(`${item.firstName} ${item.lastName}`);
        setShowSuggestions(false);
      }}>
      <Text className="text-base text-gray-900">{`${item.firstName} ${item.lastName} - ${item.course} ${item.parallel}`}</Text>
    </TouchableOpacity>
  );

  const isButtonEnabled = selectedStudent && fromDate && toDate;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {userRole !== 'STUDENT' ? (
          <>
            <Text className="mb-2 text-lg font-medium">Buscar alumno</Text>
            <TextInput
              placeholder="Nombre, curso o código"
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setShowSuggestions(true);
                if (!t) setSelectedStudent(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="rounded-lg border border-gray-200 bg-white p-3"
            />

            {showSuggestions && query.length > 0 && (
              <View className="mt-3">
                <FlatList
                  data={filtered}
                  keyExtractor={(i) => String(i.id)}
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  scrollEnabled={false}
                  ListEmptyComponent={() => (
                    <Text className="text-sm text-gray-500">No se encontraron alumnos</Text>
                  )}
                />
              </View>
            )}
          </>
        ) : (
          <Text className="mb-2 text-lg font-medium">Mis Asistencias</Text>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <View className="mr-2 flex-1">
            <Text className="mb-1 text-sm text-gray-600">Desde</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              onPress={() => setShowFromPicker(true)}>
              <Text>{fromDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowFromPicker(false);
                  if (date) setFromDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View className="ml-2 flex-1">
            <Text className="mb-1 text-sm text-gray-600">Hasta</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              onPress={() => setShowToPicker(true)}>
              <Text>{toDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowToPicker(false);
                  if (date) setToDate(date);
                }}
                minimumDate={fromDate}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`mt-4 flex-row items-center justify-center rounded-lg p-3 ${
            isButtonEnabled ? 'bg-primary-500' : 'bg-gray-300'
          }`}
          onPress={fetchAttendances}
          disabled={!isButtonEnabled || loading}>
          <Text className="font-medium text-white">
            {loading ? 'Cargando...' : 'Buscar Asistencias'}
          </Text>
        </TouchableOpacity>

        {attendances.length > 0 && (
          <View className="mt-4">
            <Text className="mb-2 text-lg font-medium">Historial de Asistencias</Text>
            <View className="space-y-2">
              {attendances.map((attendance) => (
                <View
                  key={attendance.id}
                  className="flex-row items-center justify-between rounded-lg bg-white p-3">
                  <Text className="text-base text-gray-900">
                    {new Date(attendance.date).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Por: {attendance.user.firstName} {attendance.user.lastName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
