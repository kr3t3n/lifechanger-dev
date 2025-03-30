import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { X, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const PREDEFINED_STOPS = ['Alcohol', 'Nicotine', 'Sugar', 'Late-night screens'];
const PREDEFINED_STARTS = ['Exercise routine', 'Dieting', 'Sleep routine', 'Meditation'];

export default function NewChangeScreen() {
  const router = useRouter();
  const [changeType, setChangeType] = useState<'start' | 'stop'>('stop');
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [customChange, setCustomChange] = useState('');
  const [date, setDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCustomInputSubmit = () => {
    if (customChange.trim()) {
      setSelectedChange(customChange.trim());
      Keyboard.dismiss();
    }
  };

  const currentOptions = changeType === 'start' ? PREDEFINED_STARTS : PREDEFINED_STOPS;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Life Change</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Type of Change</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity 
              style={[
                styles.typeButton,
                changeType === 'stop' && styles.selectedTypeButton
              ]}
              onPress={() => setChangeType('stop')}
            >
              <Text style={[
                styles.typeButtonText,
                changeType === 'stop' && styles.selectedTypeButtonText
              ]}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.typeButton,
                changeType === 'start' && styles.selectedTypeButton
              ]}
              onPress={() => setChangeType('start')}
            >
              <Text style={[
                styles.typeButtonText,
                changeType === 'start' && styles.selectedTypeButtonText
              ]}>Start</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            What are you going to {changeType}?
          </Text>
          <View style={[
            styles.customInputContainer,
            selectedChange === customChange && styles.selectedOptionButton
          ]}>
            <TextInput
              style={[
                styles.customInput,
                selectedChange === customChange && styles.selectedCustomInput
              ]}
              placeholder="Write your own..."
              placeholderTextColor="#666"
              value={customChange}
              onChangeText={setCustomChange}
              onFocus={() => setSelectedChange('custom')}
              onSubmitEditing={handleCustomInputSubmit}
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>
          <View style={styles.optionsList}>
            {currentOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedChange === option && styles.selectedOptionButton
                ]}
                onPress={() => {
                  setSelectedChange(option);
                  setCustomChange('');
                  Keyboard.dismiss();
                }}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedChange === option && styles.selectedOptionButtonText
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>When did this change happen?</Text>
          <View style={styles.dateContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.webDatePickerContainer}>
                <Calendar size={24} color="#00D1FF" style={styles.calendarIcon} />
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '16px',
                    width: '100%',
                    cursor: 'pointer',
                    padding: '0 12px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </View>
            ) : (
              <View>
                <TouchableOpacity style={styles.dateButton}>
                  <Calendar size={24} color="#00D1FF" style={styles.calendarIcon} />
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            (!selectedChange || (selectedChange === 'custom' && !customChange.trim())) && styles.saveButtonDisabled
          ]}
          disabled={!selectedChange || (selectedChange === 'custom' && !customChange.trim())}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={[
            styles.saveButtonText,
            (!selectedChange || (selectedChange === 'custom' && !customChange.trim())) && styles.saveButtonTextDisabled
          ]}>Save Change</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mainSection: {
    paddingBottom: 20,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
    marginTop: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#00D1FF',
  },
  typeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedTypeButtonText: {
    color: '#000',
  },
  customInputContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 8,
  },
  customInput: {
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  selectedCustomInput: {
    color: '#000',
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  selectedOptionButton: {
    backgroundColor: '#00D1FF',
  },
  optionButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedOptionButtonText: {
    color: '#000',
  },
  dateContainer: {
    marginBottom: 16,
  },
  webDatePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
  },
  calendarIcon: {
    marginRight: 12,
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00D1FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1A1A1A',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#666',
  },
});