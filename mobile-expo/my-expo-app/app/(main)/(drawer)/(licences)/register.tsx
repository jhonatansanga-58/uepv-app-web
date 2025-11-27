import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { AuthService } from "services/auth";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "constants/colors";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  course: string;
  parallel: string;
}

const Register = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingStudents(true);
        const user = await AuthService.getCurrentUser();
        if (!user?.id) return;
        const token = await AuthService.getToken();
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/mobile/tutors/${user.id}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const data = await res.json();
        const items: Student[] = data.map((s: any) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          course: s.course ?? s.courseParallel?.course?.name ?? "",
          parallel: s.parallel ?? s.courseParallel?.parallel?.name ?? "",
        }));
        setStudents(items);
      } catch (err) {
        console.error("Failed to load students", err);
        setError("Error al cargar estudiantes");
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!studentId || !title.trim() || !message.trim() || !reason.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AuthService.getToken();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/mobile/leaverequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            studentId,
            title,
            message,
            reason,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Error al registrar la licencia");
      }
      // Reset form
      setTitle("");
      setMessage("");
      setReason("");
      setStudentId(null);
      setSelectedStudent(null);
      setStartDate(new Date());
      setEndDate(new Date());
      // Navigate back to list
      router.replace("(drawer)/(licences)/licencias");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentId(student.id);
    setShowStudentDropdown(false);
  };

  if (loadingStudents) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-4">
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}

        {/* Student Selection */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Estudiante</Text>
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
            onPress={() => setShowStudentDropdown(!showStudentDropdown)}
          >
            <Text className={selectedStudent ? "text-gray-900" : "text-gray-500"}>
              {selectedStudent
                ? `${selectedStudent.firstName} ${selectedStudent.lastName} - ${selectedStudent.course} ${selectedStudent.parallel}`
                : "Seleccionar estudiante"}
            </Text>
            <Ionicons
              name={showStudentDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.gray[500]}
            />
          </TouchableOpacity>
          {showStudentDropdown && (
            <View className="bg-white border border-gray-300 border-t-0 rounded-b-lg max-h-64">
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className="border-b border-gray-200 p-3"
                  onPress={() => selectStudent(student)}
                >
                  <Text className="text-gray-900">
                    {student.firstName} {student.lastName} - {student.course} {student.parallel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Title */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Título</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
            placeholder="Ingrese el título"
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
          />
        </View>

        {/* Message */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Mensaje</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
            placeholder="Ingrese el mensaje"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Reason */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Motivo</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
            placeholder="Ingrese el motivo"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Start Date */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Fecha de inicio</Text>
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowStartPicker(true)}
            disabled={isLoading}
          >
            <Text className="text-gray-900">{startDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* End Date */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Fecha de fin</Text>
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowEndPicker(true)}
            disabled={isLoading}
          >
            <Text className="text-gray-900">{endDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
              minimumDate={startDate}
            />
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`p-3 rounded-lg flex-row justify-center items-center mt-6 mb-4 ${
            isLoading || !studentId
              ? "bg-gray-300"
              : "bg-primary-500"
          }`}
          onPress={handleSubmit}
          disabled={isLoading || !studentId}
        >
          <Text className="text-white font-medium">
            {isLoading ? "Registrando..." : "Registrar licencia"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
export default Register;