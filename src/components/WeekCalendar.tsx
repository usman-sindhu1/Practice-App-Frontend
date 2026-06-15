import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatDayNumber,
  formatMonthYear,
  formatWeekday,
  getWeekDates,
  isPastDate,
  isSameDay,
  toApiDate,
} from '../utils/availability';
import { colors } from '../theme/colors';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onWeekChange: (date: Date) => void;
}

export default function WeekCalendar({ selectedDate, onSelectDate, onWeekChange }: WeekCalendarProps) {
  const weekDates = getWeekDates(selectedDate);

  const shiftWeek = (direction: -1 | 1) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * 7);
    onWeekChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={() => shiftWeek(-1)}>
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthYear(selectedDate)}</Text>
        <Pressable style={styles.navButton} onPress={() => shiftWeek(1)}>
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekDates.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const disabled = isPastDate(date);
          return (
            <Pressable
              key={toApiDate(date)}
              style={[styles.dayCell, selected && styles.dayCellSelected]}
              onPress={() => !disabled && onSelectDate(date)}
              disabled={disabled}
            >
              <Text style={[styles.weekday, selected && styles.dayTextSelected]}>{formatWeekday(date)}</Text>
              <Text
                style={[
                  styles.dayNumber,
                  selected && styles.dayTextSelected,
                  disabled && styles.dayDisabled,
                ]}
              >
                {formatDayNumber(date)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '300',
    marginTop: -2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  weekday: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayDisabled: {
    color: colors.textMuted,
    opacity: 0.45,
  },
});
