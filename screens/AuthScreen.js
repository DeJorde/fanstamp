import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ERROR_MESSAGES = {
  'auth/invalid-email':        'That email address looks invalid.',
  'auth/email-already-in-use': 'An account already exists for that email.',
  'auth/weak-password':        'Password should be at least 6 characters.',
  'auth/invalid-credential':   'Incorrect email or password.',
  'auth/wrong-password':       'Incorrect email or password.',
  'auth/user-not-found':       'Incorrect email or password.',
  'auth/too-many-requests':    'Too many attempts — please wait a moment and try again.',
};

export function AuthScreen({ visible, onClose }) {
  const { styles } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setEmail(''); setPassword(''); setDisplayName(''); setError(''); setMode('signin');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'signup') await signUp(email, password, displayName);
      else await signIn(email, password);
      reset();
      onClose();
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>
          <View style={styles.modalHeaderBtn} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
            <Text style={styles.authIntroText}>
              {mode === 'signup'
                ? 'Create an account to back up your events and sync them across devices.'
                : 'Sign in to sync your events, bucket list, and stats across devices.'}
            </Text>

            {mode === 'signup' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Name (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={styles.dateButtonPlaceholder.color}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={styles.dateButtonPlaceholder.color}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Password'}
                placeholderTextColor={styles.dateButtonPlaceholder.color}
                secureTextEntry
              />
            </View>

            {!!error && <Text style={styles.authErrorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.onboardingPrimaryBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={styles.onboardingPrimaryBtnText}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setError(''); setMode((m) => (m === 'signup' ? 'signin' : 'signup')); }}
              activeOpacity={0.7}
            >
              <Text style={styles.authLinkText}>
                {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.authGuestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
