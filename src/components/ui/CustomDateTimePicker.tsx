import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import WheelPicker, {
  usePickerControl,
  withPickerControl,
  useOnPickerValueChangedEffect,
} from '@quidone/react-native-wheel-picker';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Spacing } from '@/constants/theme';

const ControlPicker = withPickerControl(WheelPicker);

export type CustomDateTimePickerProps = {
  initialDate?: Date;
  onConfirm?: (date: Date) => void;
  label?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
};

export function CustomDateTimePicker({
  initialDate = new Date(),
  onConfirm,
  label,
  trigger,
  children,
  visible,
  onClose,
}: CustomDateTimePickerProps) {
  const [committedDate, setCommittedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [internalModalVisible, setInternalModalVisible] = useState(false);

  const isModalVisible = visible !== undefined ? visible : internalModalVisible;
  const baseDate = committedDate ?? initialDate;

  // 30 days starting from today
  const dayOptions = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i)).map((d, i) => ({
    value: i,
    label: format(d, 'MMM d'),
  }));
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));
  const periodOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  const pickerControl = usePickerControl();

  useOnPickerValueChangedEffect(pickerControl, (event) => {
    const dayIndex = (event.pickers.day?.item?.value as number) ?? 0;
    const hour = (event.pickers.hour?.item?.value as number) ?? 12;
    const minute = (event.pickers.minute?.item?.value as number) ?? 0;
    const period = event.pickers.period?.item?.value ?? 'AM';

    let d = addDays(new Date(), dayIndex);
    const hour24 = period === 'PM' ? (hour % 12) + 12 : hour % 12;
    d = setMinutes(setHours(d, hour24), minute);
    setTempDate(d);
  });

  const openPicker = () => {
    setTempDate(baseDate);
    setInternalModalVisible(true);
  };

  const handleDone = () => {
    setCommittedDate(tempDate);
    if (visible !== undefined && onClose) {
      onClose();
    } else {
      setInternalModalVisible(false);
    }
    onConfirm?.(tempDate);
  };

  const handleCancel = () => {
    if (visible !== undefined && onClose) {
      onClose();
    } else {
      setInternalModalVisible(false);
    }
  };

  const triggerElement = trigger || children;

  return (
    <View>
      {triggerElement ? (
        <TouchableOpacity onPress={openPicker} activeOpacity={0.8}>
          {triggerElement}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={openPicker}>
          <Text style={styles.defaultTriggerText}>
            {committedDate
              ? format(committedDate, 'EEEE, MMMM d, yyyy, h:mm a')
              : label || 'Select date & time'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.headerText}>
              {format(tempDate, 'EEEE, MMMM d, yyyy, h:mm a')}
            </Text>

            <View style={styles.pickerRow}>
              <ControlPicker
                control={pickerControl}
                pickerName="day"
                data={dayOptions}
                value={0}
                width={100}
                enableScrollByTapOnItem
              />
              <ControlPicker
                control={pickerControl}
                pickerName="hour"
                data={hourOptions}
                value={4}
                width={60}
                enableScrollByTapOnItem
              />
              <ControlPicker
                control={pickerControl}
                pickerName="minute"
                data={minuteOptions}
                value={37}
                width={60}
                enableScrollByTapOnItem
              />
              <ControlPicker
                control={pickerControl}
                pickerName="period"
                data={periodOptions}
                value="PM"
                width={70}
                enableScrollByTapOnItem
              />
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDone}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default CustomDateTimePicker;

const styles = StyleSheet.create({
  defaultTriggerText: {
    color: 'white',
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: Spacing.three,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '500',
  },
  doneText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
