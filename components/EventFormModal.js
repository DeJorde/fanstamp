import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput, Platform, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORY_GROUPS, CATEGORY_COLORS, CATEGORY_ICONS, EMPTY_FORM, TEAM_TRACKED_CATEGORIES, RESULT_OPTIONS } from '../constants';
import { LEAGUE_STADIUMS } from '../leagueStadiums';
import { fetchVenueSuggestions, fetchCitySuggestions } from '../utils/geo';
import { CategoryBadge } from './CategoryBadge';
import { DatePickerField } from './DatePickerField';
import { AutocompleteField } from './AutocompleteField';
import { FullScreenPhotoModal } from './FullScreenPhotoModal';
import { useTheme } from '../context/ThemeContext';

export function EventFormModal({ visible, onClose, onSave, initialValues, editMode }) {
  const { styles, colors } = useTheme();
  const [form, setForm] = useState(initialValues ?? EMPTY_FORM);
  const [showTicketFull, setShowTicketFull] = useState(false);

  useEffect(() => {
    if (visible) setForm(initialValues ?? EMPTY_FORM);
  }, [visible]);

  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to attach photos to events.');
      return;
    }
    const remaining = 3 - form.photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets) {
      const picked = result.assets
        .slice(0, remaining)
        .filter((a) => a.base64)
        .map((a) => `data:image/jpeg;base64,${a.base64}`);
      set('photos', [...form.photos, ...picked]);
    }
  }

  async function pickTicketPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to attach a ticket photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      set('ticketPhoto', `data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  async function fetchTeamSuggestions(query) {
    const teams = LEAGUE_STADIUMS[form.category] ?? [];
    const q = query.toLowerCase();
    return teams
      .filter((t) => t.team.toLowerCase().includes(q))
      .slice(0, 8)
      .map((t) => ({ id: t.team, name: t.team, subtitle: t.stadium }));
  }

  const canSave = form.name.trim().length > 0 && form.venue.trim().length > 0;
  const showTeamFields = TEAM_TRACKED_CATEGORIES.includes(form.category);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editMode ? 'Edit Event' : 'New Event'}</Text>
          <TouchableOpacity onPress={() => canSave && onSave(form)} style={styles.modalHeaderBtn} disabled={!canSave}>
            <Text style={[styles.modalSaveText, !canSave && styles.modalSaveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Event Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Lakers vs Warriors" placeholderTextColor={colors.placeholder} value={form.name} onChangeText={(v) => set('name', v)} />
            </View>

            {showTeamFields && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Home Team</Text>
                  <AutocompleteField
                    value={form.homeTeam}
                    placeholder="e.g. Los Angeles Lakers"
                    fetchSuggestions={fetchTeamSuggestions}
                    onChangeText={(v) => set('homeTeam', v)}
                    onSelect={(r) => set('homeTeam', r.name)}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Away Team</Text>
                  <AutocompleteField
                    value={form.awayTeam}
                    placeholder="e.g. Golden State Warriors"
                    fetchSuggestions={fetchTeamSuggestions}
                    onChangeText={(v) => set('awayTeam', v)}
                    onSelect={(r) => set('awayTeam', r.name)}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Game Result</Text>
                  <View style={styles.resultChipRow}>
                    {RESULT_OPTIONS.map((opt) => {
                      const active = form.result === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.resultChip, active && styles.resultChipActive]}
                          onPress={() => set('result', active ? null : opt.value)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.resultChipText, active && styles.resultChipTextActive]}>
                            {opt.icon} {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Venue *</Text>
              <AutocompleteField
                value={form.venue}
                placeholder="e.g. Crypto.com Arena"
                fetchSuggestions={fetchVenueSuggestions}
                onChangeText={(v) => set('venue', v)}
                onSelect={(r) => setForm((prev) => ({
                  ...prev,
                  venue: r.name,
                  ...(r.cityName && { city: r.cityName }),
                }))}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>City</Text>
              <AutocompleteField
                value={form.city}
                placeholder="e.g. Los Angeles, CA"
                fetchSuggestions={fetchCitySuggestions}
                onChangeText={(v) => set('city', v)}
                onSelect={(r) => set('city', r.cityName || r.name)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              <DatePickerField value={form.date} onChange={(v) => set('date', v)} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              {CATEGORY_GROUPS.map((group) => (
                <View key={group.key} style={styles.categoryGroupSection}>
                  <Text style={styles.categoryGroupLabel}>{group.label}</Text>
                  <View style={styles.categoryRow}>
                    {group.categories.map((cat) => {
                      const active = form.category === cat;
                      const colors = CATEGORY_COLORS[cat];
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.categoryChip, active && { backgroundColor: colors.bg, borderColor: colors.text }]}
                          onPress={() => set('category', cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.categoryChipText, active && { color: colors.text }]}>
                            {CATEGORY_ICONS[cat]} {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Personal Notes</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Seats, who you went with, memories..." placeholderTextColor={colors.placeholder} value={form.notes} onChangeText={(v) => set('notes', v)} multiline numberOfLines={4} textAlignVertical="top" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Photos ({form.photos.length}/3)</Text>
              {form.photos.length > 0 && (
                <View style={styles.photoPickerRow}>
                  {form.photos.map((uri, i) => (
                    <View key={i} style={styles.photoPickerThumbWrap}>
                      <Image source={{ uri }} style={styles.photoPickerThumb} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.photoPickerRemove}
                        onPress={() => set('photos', form.photos.filter((_, idx) => idx !== i))}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.photoPickerRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {form.photos.length < 3 && (
                <TouchableOpacity style={styles.photoPickerAddBtn} onPress={pickPhoto} activeOpacity={0.7}>
                  <Text style={styles.photoPickerAddIcon}>＋</Text>
                  <Text style={styles.photoPickerAddText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Ticket</Text>
              {form.ticketPhoto ? (
                <>
                  <View style={styles.photoPickerRow}>
                    <View style={styles.photoPickerThumbWrap}>
                      <Image source={{ uri: form.ticketPhoto }} style={styles.photoPickerThumb} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.photoPickerRemove}
                        onPress={() => set('ticketPhoto', null)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.photoPickerRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.photoPickerAddBtn} onPress={() => setShowTicketFull(true)} activeOpacity={0.7}>
                    <Text style={styles.photoPickerAddIcon}>🔍</Text>
                    <Text style={styles.photoPickerAddText}>Read Ticket</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.photoPickerAddBtn} onPress={pickTicketPhoto} activeOpacity={0.7}>
                  <Text style={styles.photoPickerAddIcon}>🎟</Text>
                  <Text style={styles.photoPickerAddText}>Add Ticket</Text>
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        <FullScreenPhotoModal uri={showTicketFull ? form.ticketPhoto : null} onClose={() => setShowTicketFull(false)} />
      </View>
    </Modal>
  );
}
