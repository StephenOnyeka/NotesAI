import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import {
  Magicpen,
  CloseSquare,
  Microphone,
  Send2,
  TickCircle,
  Danger,
  NoteText,
  TaskSquare,
} from 'iconsax-react-nativejs';
import { Colors, Spacing } from '@/constants/theme';
import { processAICommand, getActiveApiKey, type AICommandResponse } from '@/services/gemini';
import { useNotes } from '@/hooks/useNotes';
import { useTodos } from '@/hooks/useTodos';

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  activeTab?: 'notes' | 'todo';
  onNoteCreated?: (noteId: string) => void;
}

export function AIAssistantModal({
  visible,
  onClose,
  activeTab = 'notes',
  onNoteCreated,
}: AIAssistantModalProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { addNote } = useNotes();
  const { addTodo } = useTodos();

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<AICommandResponse | null>(null);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setErrorMsg(null);
      setSuccessResult(null);
      const activeKey = getActiveApiKey();
      if (!activeKey) {
        setErrorMsg('Gemini API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
      }
    } else {
      stopListening();
    }
  }, [visible]);

  // Speech Recognition setup (Web Speech API)
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition is not supported on this browser/device. Please type your command.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setErrorMsg('Could not start voice recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleProcessCommand = async (commandToRun?: string) => {
    const prompt = (commandToRun || inputText).trim();
    if (!prompt) return;

    stopListening();
    setLoading(true);
    setErrorMsg(null);
    setSuccessResult(null);

    try {
      const response = await processAICommand(prompt, activeTab);

      if (response.action === 'create_note' && response.note) {
        const createdNote = addNote({
          title: response.note.title,
          contentHTML: response.note.contentHTML,
          colorTag: response.note.colorTag || '#7C3AED',
        });
        setSuccessResult(response);
        if (onNoteCreated) {
          onNoteCreated(createdNote.id);
        }
      } else if (response.action === 'create_todos' && response.todos) {
        response.todos.forEach((item) => {
          if (item.title) {
            addTodo({ title: item.title });
          }
        });
        setSuccessResult(response);
      } else {
        setErrorMsg('Could not process the command. Please try again with details.');
      }
    } catch (err: any) {
      if (err?.message === 'MISSING_API_KEY') {
        setErrorMsg('Gemini API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
      } else {
        setErrorMsg(err?.message || 'Failed to communicate with Gemini AI. Check network or API Key.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChipPress = (promptText: string) => {
    setInputText(promptText);
    handleProcessCommand(promptText);
  };

  const suggestions = [
    { label: '📝 Project Meeting Notes', text: 'Create a note summarizing project kickoff meeting agenda and key goals' },
    { label: '✅ Grocery Shopping List', text: 'Create a to-do list for buying groceries including milk, eggs, bread, and fruits' },
    { label: '✈️ Weekend Travel Prep', text: 'Create a to-do list for packing for a weekend beach trip' },
    { label: '💡 App Feature Ideas', text: 'Create a note detailing 4 creative feature ideas for a mobile productivity app' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          {/* Top handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.textSecondary + '40' }]} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.aiBadge}>
                <Magicpen size={18} color="#FFFFFF" variant="Bold" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Gemini AI Assistant</Text>
              <View
                style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === 'notes' ? '#7C3AED20' : '#3B82F620' },
                ]}
              >
                {activeTab === 'notes' ? (
                  <NoteText size={12} color="#7C3AED" variant="Bold" />
                ) : (
                  <TaskSquare size={12} color="#3B82F6" variant="Bold" />
                )}
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: activeTab === 'notes' ? '#7C3AED' : '#3B82F6' },
                  ]}
                >
                  {activeTab === 'notes' ? 'Notes Mode' : 'To-Do Mode'}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={8}>
                <CloseSquare size={24} color={colors.textSecondary} variant="Bold" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Prompt Suggestions */}
          {!loading && !successResult && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, { backgroundColor: colors.background }]}
                  onPress={() => handleChipPress(item.text)}
                >
                  <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Error display */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Danger size={18} color="#FF6B6B" variant="Bold" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Success Result display */}
          {successResult && (
            <View style={[styles.successBox, { backgroundColor: colors.background }]}>
              <View style={styles.successHeader}>
                <TickCircle size={22} color="#10B981" variant="Bold" />
                <Text style={[styles.successTitle, { color: colors.text }]}>Command Executed!</Text>
              </View>
              <Text style={[styles.successSummary, { color: colors.textSecondary }]}>
                {successResult.summary}
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setSuccessResult(null);
                  setInputText('');
                  onClose();
                }}
              >
                <Text style={styles.doneBtnText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading state */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Gemini is generating your {activeTab === 'notes' ? 'note' : 'to-do list'}...
              </Text>
            </View>
          )}

          {/* Input Row with Mic & Submit */}
          {!successResult && (
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={
                    isListening
                      ? 'Listening to your voice command...'
                      : activeTab === 'notes'
                      ? 'e.g. "Create a note for my workout plan"'
                      : 'e.g. "Create a to-do list for my project"'
                  }
                  placeholderTextColor={isListening ? '#7C3AED' : colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  editable={!loading}
                />

                {/* Voice Microphone Button */}
                <TouchableOpacity
                  onPress={toggleListening}
                  style={[
                    styles.micBtn,
                    isListening && styles.micBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Microphone
                    size={20}
                    color={isListening ? '#FFFFFF' : colors.textSecondary}
                    variant={isListening ? 'Bold' : 'Outline'}
                  />
                </TouchableOpacity>

                {/* Send Button */}
                <TouchableOpacity
                  onPress={() => handleProcessCommand()}
                  disabled={loading || !inputText.trim()}
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor:
                        inputText.trim() && !loading ? '#7C3AED' : colors.textSecondary + '30',
                    },
                  ]}
                >
                  <Send2 size={18} color="#FFFFFF" variant="Bold" />
                </TouchableOpacity>
              </View>

              {isListening && (
                <Text style={styles.listeningHint}>🎙️ Listening... Speak your command clearly</Text>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.four,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  keyContainer: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: 6,
    marginVertical: 4,
  },
  keyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  keyInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  keyInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 10,
    fontSize: 13,
  },
  saveKeyBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveKeyBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  keyHint: {
    fontSize: 11,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B15',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    flex: 1,
  },
  successBox: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: 8,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  successSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 4,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 50,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningHint: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    marginTop: 2,
  },
});
