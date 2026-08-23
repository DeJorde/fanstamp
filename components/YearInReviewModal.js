import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getAvailableYears, computeYearInReview } from '../utils/yearInReview';
import { shareViewAsImage } from '../utils/shareImage';
import { YearInReviewCard } from './YearInReviewCard';
import { useTheme } from '../context/ThemeContext';

export function YearInReviewModal({ visible, onClose, events }) {
  const { styles } = useTheme();
  const cardRef = useRef(null);

  const years = useMemo(() => getAvailableYears(events), [events]);
  const currentCalendarYear = new Date().getFullYear();
  const defaultYear = years.includes(currentCalendarYear) ? currentCalendarYear : (years[0] ?? currentCalendarYear);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Re-anchor the default whenever the modal is reopened or the event set
  // changes years available (e.g. the very first event of a new year is
  // added) — without this, a stale selectedYear from a prior open could
  // point at a year no longer relevant.
  useEffect(() => {
    if (visible) setSelectedYear(defaultYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const review = useMemo(() => computeYearInReview(events, selectedYear), [events, selectedYear]);

  async function handleShare() {
    if (!cardRef.current) return;
    try {
      await shareViewAsImage(cardRef, `My ${selectedYear} FanStamp Year in Review 🎉 #FanStamp`);
    } catch {
      Alert.alert('Share Failed', 'Could not create the image to share. Please try again.');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderBtn} />
          <Text style={styles.modalTitle}>Year in Review</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
        </View>

        {years.length === 0 ? (
          <View style={styles.statsEmpty}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>No dated events yet</Text>
            <Text style={styles.emptySubtext}>Add a date to an event to build your Year in Review</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.yrPickerWrap}
              contentContainerStyle={styles.yrPickerRow}
            >
              {years.map((y) => {
                const active = y === selectedYear;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yrPickerChip, active && styles.yrPickerChipActive]}
                    onPress={() => setSelectedYear(y)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yrPickerChipText, active && styles.yrPickerChipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.yrModalScroll} showsVerticalScrollIndicator={false}>
              <YearInReviewCard ref={cardRef} review={review} />
            </ScrollView>

            <TouchableOpacity style={styles.yrShareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Text style={styles.yrShareBtnText}>📤 Share {selectedYear} Recap</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}
