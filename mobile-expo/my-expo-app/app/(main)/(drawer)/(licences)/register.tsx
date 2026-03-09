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

interface ValidationErrors {
  student?: string;
  title?: string;
  message?: string;
  reason?: string;
  dates?: string;
}

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;
const REASON_MIN_LENGTH = 5;
const REASON_MAX_LENGTH = 500;

const validateForm = (
  studentId: number | null,
  title: string,
  message: string,
  reason: string,
  startDate: Date,
  endDate: Date
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!studentId) {
    errors.student = "Seleccione un estudiante";
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    errors.title = "El título es obligatorio";
  } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    errors.title = `El título debe tener al menos ${TITLE_MIN_LENGTH} caracteres`;
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    errors.message = "El mensaje es obligatorio";
  } else if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
    errors.message = `El mensaje debe tener al menos ${MESSAGE_MIN_LENGTH} caracteres`;
  } else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    errors.message = `El mensaje no puede exceder ${MESSAGE_MAX_LENGTH} caracteres`;
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    errors.reason = "El motivo es obligatorio";
  } else if (trimmedReason.length < REASON_MIN_LENGTH) {
    errors.reason = `El motivo debe tener al menos ${REASON_MIN_LENGTH} caracteres`;
  } else if (trimmedReason.length > REASON_MAX_LENGTH) {
    errors.reason = `El motivo no puede exceder ${REASON_MAX_LENGTH} caracteres`;
  }

  // Allow same-day leaves (periods of one day). Only invalidate when
  // the end date is earlier than the start date.
  if (startDate.getTime() > endDate.getTime()) {
    errors.dates = "La fecha de fin no puede ser anterior a la fecha de inicio";
  }

  return errors;
};

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
    setValidationErrors({});

    // Validate form
    const errors = validateForm(studentId, title, message, reason, startDate, endDate);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
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
            title: title.trim(),
            message: message.trim(),
            reason: reason.trim(),
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
      Alert.alert("Éxito", "Licencia registrada correctamente");
      // Navigate back to list
      router.replace("(drawer)/(licences)/licencias");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      console.error("Failed to register leave", err);
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
          <Text className="text-sm font-medium text-gray-700 mb-2">Estudiante *</Text>
          <TouchableOpacity
            className={`bg-white border rounded-lg p-3 flex-row justify-between items-center ${
              validationErrors.student ? "border-red-300" : "border-gray-300"
            }`}
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
          {validationErrors.student && (
            <Text className="text-red-500 text-xs mt-1">{validationErrors.student}</Text>
          )}
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
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Título *</Text>
            <Text className="text-xs text-gray-500">
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`bg-white border rounded-lg p-3 text-gray-900 ${
              validationErrors.title ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Mín. 5 caracteres"
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
            maxLength={TITLE_MAX_LENGTH}
          />
          {validationErrors.title && (
            <Text className="text-red-500 text-xs mt-1">{validationErrors.title}</Text>
          )}
        </View>

        {/* Message */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Mensaje *</Text>
            <Text className="text-xs text-gray-500">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`bg-white border rounded-lg p-3 text-gray-900 ${
              validationErrors.message ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Mín. 10 caracteres"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
            maxLength={MESSAGE_MAX_LENGTH}
          />
          {validationErrors.message && (
            <Text className="text-red-500 text-xs mt-1">{validationErrors.message}</Text>
          )}
        </View>

        {/* Reason */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Motivo *</Text>
            <Text className="text-xs text-gray-500">
              {reason.length}/{REASON_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`bg-white border rounded-lg p-3 text-gray-900 ${
              validationErrors.reason ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Mín. 5 caracteres"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
            maxLength={REASON_MAX_LENGTH}
          />
          {validationErrors.reason && (
            <Text className="text-red-500 text-xs mt-1">{validationErrors.reason}</Text>
          )}
        </View>

        {/* Dates Section */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-3">Fechas *</Text>
          <View className="flex-row gap-3">
            {/* Start Date */}
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Inicio</Text>
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
                    if (date) {
                      setStartDate(date);
                      setValidationErrors(prev => ({ ...prev, dates: "" }));
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* End Date */}
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Fin</Text>
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
                    if (date) {
                      setEndDate(date);
                      setValidationErrors(prev => ({ ...prev, dates: "" }));
                    }
                  }}
                  minimumDate={startDate}
                />
              )}
            </View>
          </View>
          {validationErrors.dates && (
            <Text className="text-red-500 text-xs mt-1">{validationErrors.dates}</Text>
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



MONDONGOOOOOOOOOOOOOOOOOOOO
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
