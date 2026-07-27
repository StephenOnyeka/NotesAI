import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme } from 'react-native';
import WheelPicker, {
  usePickerControl,
  withPickerControl,
  useOnPickerValueChangedEffect,
} from '@quidone/react-native-wheel-picker';
import { format, addDays, setHours, setMinutes, differenceInCalendarDays } from 'date-fns';
import { Colors, Spacing } from '@/constants/theme';

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
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [committedDate, setCommittedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [internalModalVisible, setInternalModalVisible] = useState(false);

  const isModalVisible = visible !== undefined ? visible : internalModalVisible;

  // Track visibility to sync tempDate immediately during render (optimistic UI / avoids double render)
  const [prevVisible, setPrevVisible] = useState(isModalVisible);
  
  if (isModalVisible && !prevVisible) {
    setPrevVisible(true);
    setTempDate(committedDate ?? initialDate);
  } else if (!isModalVisible && prevVisible) {
    setPrevVisible(false);
  }

  // 30 days starting from today
  const dayOptions = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => addDays(new Date(), i)).map((d, i) => ({
      value: i,
      label: format(d, 'MMM d'),
    }));
  }, []);

  const hourOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  }, []);

  const minuteOptions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: i,
      label: String(i).padStart(2, '0'),
    }));
  }, []);

  const periodOptions = useMemo(
    () => [
      { value: 'AM', label: 'AM' },
      { value: 'PM', label: 'PM' },
    ],
    []
  );

  const selectedDayIndex = useMemo(() => {
    const diff = differenceInCalendarDays(tempDate, new Date());
    return Math.max(0, Math.min(29, diff));
  }, [tempDate]);

  const selectedHour = useMemo(() => {
    const hours = tempDate.getHours();
    const h12 = hours % 12;
    return h12 === 0 ? 12 : h12;
  }, [tempDate]);

  const selectedMinute = useMemo(() => {
    return tempDate.getMinutes();
  }, [tempDate]);

  const selectedPeriod = useMemo(() => {
    return tempDate.getHours() >= 12 ? 'PM' : 'AM';
  }, [tempDate]);

  const pickerControl = usePickerControl();

  useOnPickerValueChangedEffect(pickerControl, (event) => {
    const dayIndex = (event.pickers.day?.item?.value as number) ?? selectedDayIndex;
    const hour = (event.pickers.hour?.item?.value as number) ?? selectedHour;
    const minute = (event.pickers.minute?.item?.value as number) ?? selectedMinute;
    const period = (event.pickers.period?.item?.value as string) ?? selectedPeriod;

    let d = addDays(new Date(), dayIndex);
    const hour24 = period === 'PM' ? (hour % 12) + 12 : hour % 12;
    d = setMinutes(setHours(d, hour24), minute);
    setTempDate(d);
  });

  const openPicker = () => {
    setTempDate(committedDate ?? initialDate);
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

  // Theme-aware styles computed at render time
  const pickerItemTextStyle = { color: colors.text, fontSize: 15 };
  const pickerOverlayItemStyle = {
    borderColor: colors.backgroundSelected,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: colors.backgroundSelected + '50',
  };

  return (
    <View>
      {triggerElement ? (
        <TouchableOpacity onPress={openPicker} activeOpacity={0.8}>
          {triggerElement}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={openPicker}>
          <Text style={[styles.defaultTriggerText, { color: colors.text }]}>
            {/* {committedDate
              ? format(committedDate, 'EEEE, MMMM d, yyyy, h:mm a')
              : label || 'Select date & time'} */}
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
          <View style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: colors.textSecondary + '40' }]} />

            <Text style={[styles.headerText, { color: colors.text }]}>
              {format(tempDate, 'EEEE, MMMM d, yyyy, h:mm a')}
            </Text>

            <View style={[styles.pickerSeparator, { backgroundColor: colors.backgroundSelected }]} />

            <View style={styles.pickerRow}>
              <ControlPicker
                control={pickerControl}
                pickerName="day"
                data={dayOptions}
                value={selectedDayIndex}
                width={100}
                enableScrollByTapOnItem
                itemTextStyle={pickerItemTextStyle}
                overlayItemStyle={pickerOverlayItemStyle}
                style={{ backgroundColor: 'transparent' }}
              />
              <ControlPicker
                control={pickerControl}
                pickerName="hour"
                data={hourOptions}
                value={selectedHour}
                width={60}
                enableScrollByTapOnItem
                itemTextStyle={pickerItemTextStyle}
                overlayItemStyle={pickerOverlayItemStyle}
                style={{ backgroundColor: 'transparent' }}
              />
              <ControlPicker
                control={pickerControl}
                pickerName="minute"
                data={minuteOptions}
                value={selectedMinute}
                width={60}
                enableScrollByTapOnItem
                itemTextStyle={pickerItemTextStyle}
                overlayItemStyle={pickerOverlayItemStyle}
                style={{ backgroundColor: 'transparent' }}
              />
              <ControlPicker
                control={pickerControl}
                pickerName="period"
                data={periodOptions}
                value={selectedPeriod}
                width={70}
                enableScrollByTapOnItem
                itemTextStyle={pickerItemTextStyle}
                overlayItemStyle={pickerOverlayItemStyle}
                style={{ backgroundColor: 'transparent' }}
              />
            </View>

            <View style={[styles.pickerSeparator, { backgroundColor: colors.backgroundSelected }]} />

            <View style={styles.footerRow}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDone}>
                <Text style={styles.doneText}>Confirm</Text>
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
    fontSize: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.three,
    paddingBottom: 32,
    gap: Spacing.two,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  headerText: {
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerSeparator: {
    height: 1,
    marginHorizontal: Spacing.two,
    borderRadius: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  doneText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
});


