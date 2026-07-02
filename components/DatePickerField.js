import { View, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { parseDateStr, toStorageDate, formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';

export function DatePickerField({ value, onChange }) {
  const { styles } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  // iOS: track a temp value until the user taps Done
  const [tempDate, setTempDate] = useState(parseDateStr(value));

  const hasValue = !!value;
  const dateObj  = parseDateStr(value);

  function openPicker() {
    setTempDate(dateObj);
    setShowPicker(true);
  }

  function handleChange(event, selected) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type !== 'dismissed' && selected) onChange(toStorageDate(selected));
    } else {
      // iOS: only update tempDate; commit on Done
      if (selected) setTempDate(selected);
    }
  }

  function handleIOSDone() {
    onChange(toStorageDate(tempDate));
    setShowPicker(false);
  }

  return (
    <View>
      <TouchableOpacity style={styles.dateButton} onPress={openPicker} activeOpacity={0.7}>
        <Text style={hasValue ? styles.dateButtonValue : styles.dateButtonPlaceholder}>
          {hasValue ? formatDisplayDate(value) : 'Tap to select a date'}
        </Text>
        <Text>📅</Text>
      </TouchableOpacity>

      {/* Android: native dialog spawned directly */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker value={dateObj} mode="date" onChange={handleChange} />
      )}

      {/* iOS: bottom-sheet modal with spinner and Done button */}
      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.dateModalBackdrop}>
            <View style={styles.dateModalSheet}>
              <View style={styles.dateModalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.dateModalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSDone}>
                  <Text style={styles.dateModalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={styles.dateSpinner}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
