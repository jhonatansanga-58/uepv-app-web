import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { AuthService } from 'services/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from 'constants/colors';
import * as DocumentPicker from 'expo-document-picker';

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
    errors.student = 'Seleccione un estudiante';
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    errors.title = 'El título es obligatorio';
  } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    errors.title = `El título debe tener al menos ${TITLE_MIN_LENGTH} caracteres`;
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    errors.message = 'El mensaje es obligatorio';
  } else if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
    errors.message = `El mensaje debe tener al menos ${MESSAGE_MIN_LENGTH} caracteres`;
  } else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    errors.message = `El mensaje no puede exceder ${MESSAGE_MAX_LENGTH} caracteres`;
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    errors.reason = 'El motivo es obligatorio';
  } else if (trimmedReason.length < REASON_MIN_LENGTH) {
    errors.reason = `El motivo debe tener al menos ${REASON_MIN_LENGTH} caracteres`;
  } else if (trimmedReason.length > REASON_MAX_LENGTH) {
    errors.reason = `El motivo no puede exceder ${REASON_MAX_LENGTH} caracteres`;
  }

  if (startDate.getTime() > endDate.getTime()) {
    errors.dates = 'La fecha de fin no puede ser anterior a la fecha de inicio';
  }

  return errors;
};

const Register = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [evidenceFile, setEvidenceFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingStudents(true);
        const user = await AuthService.getCurrentUser();
        if (!user?.id) return;

        setUserRole(user.role);

        if (user.role === 'STUDENT') {
          const stdId = user.id;
          setStudentId(stdId);
          setSelectedStudent({
            id: stdId,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            course: '',
            parallel: '',
          });
          setStudents([]);
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
        const items: Student[] = data.map((s: any) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          course: s.course ?? s.courseParallel?.course?.name ?? '',
          parallel: s.parallel ?? s.courseParallel?.parallel?.name ?? '',
        }));
        setStudents(items);
      } catch (err) {
        console.error('Failed to load students', err);
        setError('Error al cargar estudiantes');
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'], // Allow images and PDFs
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEvidenceFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setValidationErrors({});

    const errors = validateForm(studentId, title, message, reason, startDate, endDate);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AuthService.getToken();

      const formData = new FormData();
      formData.append('studentId', String(studentId));
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      formData.append('reason', reason.trim());
      formData.append('startDate', startDate.toISOString().split('T')[0]);
      formData.append('endDate', endDate.toISOString().split('T')[0]);

      if (evidenceFile) {
        formData.append('evidence', {
          uri: evidenceFile.uri,
          name: evidenceFile.name,
          type: evidenceFile.mimeType || 'application/octet-stream',
        } as any);
      }

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/leaverequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do not set Content-Type, FormData sets it automatically with boundary
          Accept: 'application/json',
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Error al registrar la licencia');
      }

      setTitle('');
      setMessage('');
      setReason('');
      if (userRole !== 'STUDENT') {
        setStudentId(null);
        setSelectedStudent(null);
      }
      setStartDate(new Date());
      setEndDate(new Date());
      setEvidenceFile(null);
      Alert.alert('Éxito', 'Licencia registrada correctamente');
      router.replace('(drawer)/(licences)/licencias');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      console.error('Failed to register leave', err);
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="space-y-4 p-4 shadow-sm">
        {error && (
          <View className="rounded-lg border border-red-200 bg-red-50 p-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        {/* Student Selection */}
        {userRole !== 'STUDENT' && (
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Estudiante *</Text>
            <TouchableOpacity
              className={`flex-row items-center justify-between rounded-lg border bg-white p-3 ${
                validationErrors.student ? 'border-red-300' : 'border-gray-300'
              }`}
              onPress={() => setShowStudentDropdown(!showStudentDropdown)}>
              <Text className={selectedStudent ? 'text-gray-900' : 'text-gray-500'}>
                {selectedStudent
                  ? `${selectedStudent.firstName} ${selectedStudent.lastName} - ${selectedStudent.course} ${selectedStudent.parallel}`
                  : 'Seleccionar estudiante'}
              </Text>
              <Ionicons
                name={showStudentDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.gray[500]}
              />
            </TouchableOpacity>
            {validationErrors.student && (
              <Text className="mt-1 text-xs text-red-500">{validationErrors.student}</Text>
            )}
            {showStudentDropdown && (
              <View className="max-h-64 rounded-b-lg border border-t-0 border-gray-300 bg-white">
                {students.map((student) => (
                  <TouchableOpacity
                    key={student.id}
                    className="border-b border-gray-200 p-3"
                    onPress={() => selectStudent(student)}>
                    <Text className="text-gray-900">
                      {student.firstName} {student.lastName} - {student.course} {student.parallel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">Título *</Text>
            <Text className="text-xs text-gray-500">
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`rounded-lg border bg-white p-3 text-gray-900 ${
              validationErrors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Mín. 5 caracteres"
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
            maxLength={TITLE_MAX_LENGTH}
          />
          {validationErrors.title && (
            <Text className="mt-1 text-xs text-red-500">{validationErrors.title}</Text>
          )}
        </View>

        {/* Message */}
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">Mensaje *</Text>
            <Text className="text-xs text-gray-500">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`rounded-lg border bg-white p-3 text-gray-900 ${
              validationErrors.message ? 'border-red-300' : 'border-gray-300'
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
            <Text className="mt-1 text-xs text-red-500">{validationErrors.message}</Text>
          )}
        </View>

        {/* Reason */}
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">Motivo *</Text>
            <Text className="text-xs text-gray-500">
              {reason.length}/{REASON_MAX_LENGTH}
            </Text>
          </View>
          <TextInput
            className={`rounded-lg border bg-white p-3 text-gray-900 ${
              validationErrors.reason ? 'border-red-300' : 'border-gray-300'
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
            <Text className="mt-1 text-xs text-red-500">{validationErrors.reason}</Text>
          )}
        </View>

        {/* Dates Section */}
        <View>
          <Text className="mb-3 text-sm font-medium text-gray-700">Fechas *</Text>
          <View className="flex-row gap-3">
            {/* Start Date */}
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-600">Inicio</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white p-3"
                onPress={() => setShowStartPicker(true)}
                disabled={isLoading}>
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
                      setValidationErrors((prev) => ({ ...prev, dates: '' }));
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* End Date */}
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-600">Fin</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white p-3"
                onPress={() => setShowEndPicker(true)}
                disabled={isLoading}>
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
                      setValidationErrors((prev) => ({ ...prev, dates: '' }));
                    }
                  }}
                  minimumDate={startDate}
                />
              )}
            </View>
          </View>
          {validationErrors.dates && (
            <Text className="mt-1 text-xs text-red-500">{validationErrors.dates}</Text>
          )}
        </View>

        {/* File Picker Section */}
        <View className="mt-2">
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Evidencia (📸 Imagen / PDF)
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-center space-x-2 rounded-lg border border-dashed border-primary-500 bg-white p-4"
            onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary[500]} />
            <Text className="font-medium text-primary-600">
              {evidenceFile ? evidenceFile.name : 'Subir archivo (opcional)'}
            </Text>
          </TouchableOpacity>
          {evidenceFile && (
            <TouchableOpacity className="mt-2 self-center" onPress={() => setEvidenceFile(null)}>
              <Text className="text-sm text-red-500">Eliminar archivo adjunto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`mb-4 mt-6 flex-row items-center justify-center rounded-lg p-3 ${
            isLoading || !studentId ? 'bg-gray-300' : 'bg-primary-500'
          }`}
          onPress={handleSubmit}
          disabled={isLoading || !studentId}>
          <Text className="font-medium text-white">
            {isLoading ? 'Registrando...' : 'Registrar licencia'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Register;
