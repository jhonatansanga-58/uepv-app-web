
/*import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Layout from '../components/Layout';
import { AuthService } from '../services/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type StudentMinimal = { id: number; label: string };
type AttendanceType = { id: number; date: string; user?: { id: number; firstName: string; lastName: string } | null };

export default function AttendanceScreen() {
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentMinimal[]>([]);
  const [filtered, setFiltered] = useState<StudentMinimal[]>([]);
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user and token from secure store
    async function loadAuth() {
      const u = await AuthService.getCurrentUser();
      const t = await AuthService.getToken();
      setUser(u);
      setToken(t);
    }
    loadAuth();
  }, []);

  useEffect(() => {
    // Load students based on role
    async function loadStudents() {
      if (!user || !token) return;
      try {
        if (user.role === 'TUTOR') {
          const res = await fetch(`${API_URL}/api/tutors/${user.id}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setStudents((data || []).map((s: any) => ({
            id: s.id,
            label: `${s.firstName} ${s.lastName}${s.course ? ` - ${s.course}` : ''}${s.parallel ? ` - ${s.parallel}` : ''}`,
          })));
        } else if (user.role === 'STUDENT') {
          const res = await fetch(`${API_URL}/api/students/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const s = await res.json();
          const label = `${s.user.firstName} ${s.user.lastName}${s.courseParallel?.course?.name ? ` - ${s.courseParallel.course.name}` : ''}${s.courseParallel?.parallel?.name ? ` - ${s.courseParallel.parallel.name}` : ''}`;
          setStudents([{ id: s.id, label }]);
          setQuery(label);
          setStudentId(s.id);
        } else {
          const res = await fetch(`${API_URL}/api/students/allminimal`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setStudents(data || []);
        }
      } catch {
        // handle error
      }
    }
    loadStudents();
  }, [user, token]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered([]); return; }
    setFiltered(students.filter(s => s.label.toLowerCase().includes(q)).slice(0, 20));
  }, [query, students]);

  const handleSelectStudent = (s: StudentMinimal) => {
    setStudentId(s.id);
    setQuery(s.label);
    setFiltered([]);
  };

  const fetchAttendances = async () => {
    if (!studentId || !fromDate || !toDate || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance?studentId=${studentId}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAttendances(data || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <View className="p-4">
        <Text className="text-base font-semibold mb-2">Estudiante</Text>
        {user?.role === 'STUDENT' ? (
          <View className="p-2 bg-gray-100 rounded mb-4">
            <Text>{students[0]?.label || 'Estudiante'}</Text>
          </View>
        ) : (
          <View className="mb-4">
            <TextInput
              placeholder="Buscar estudiante..."
              value={query}
              onChangeText={setQuery}
              className="border rounded px-3 py-2 bg-white"
            />
            {query && filtered.length > 0 && (
              <View className="bg-white border rounded max-h-40 mt-1">
                <FlatList
                  data={filtered}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectStudent(item)} className="p-2 border-b">
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        )}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-1">Desde</Text>
            <TouchableOpacity onPress={() => setShowFromPicker(true)} className="border rounded px-3 py-2 bg-white">
              <Text>{fromDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={(_event: any, date?: Date) => {
                  setShowFromPicker(false);
                  if (date) setFromDate(date);
                }}
              />
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-1">Hasta</Text>
            <TouchableOpacity onPress={() => setShowToPicker(true)} className="border rounded px-3 py-2 bg-white">
              <Text>{toDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={(_event: any, date?: Date) => {
                  setShowToPicker(false);
                  if (date) setToDate(date);
                }}
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={fetchAttendances}
          disabled={!studentId || !fromDate || !toDate}
          className="bg-primary-600 rounded px-4 py-2 mb-4"
        >
          <Text className="text-white text-center font-semibold">Buscar</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <View className="bg-white border rounded">
            {attendances.length === 0 ? (
              <Text className="p-4 text-gray-500">No hay registros</Text>
            ) : (
              <FlatList
                data={attendances}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="flex-row border-b px-4 py-2 items-center">
                    <View className="flex-1">
                      <Text className="font-medium">{new Date(item.date).toLocaleString()}</Text>
                      <Text className="text-gray-600 text-xs">{item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Dispositivo'}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </Layout>
  );
}
*/