import { WatchlistColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type ZenQuestionOptionKey = 'A' | 'B' | 'C';

type ZenQuestion = {
  prompt: string;
  dimension: string;
  dimensionCode: string;
  options: Record<ZenQuestionOptionKey, string>;
};

const ALL_QUESTIONS: ZenQuestion[] = [
  {
    prompt: 'When a trade moves against you by 15%, what is your first instinct?',
    dimension: 'Loss Endurance',
    dimensionCode: 'LE',
    options: {
      A: 'Cut the loss immediately and move on.',
      B: 'Wait and see if it recovers before deciding.',
      C: 'Average down — I believe in my thesis.',
    },
  },
  {
    prompt: 'How do you typically react when you miss a big market move?',
    dimension: 'FOMO Handling',
    dimensionCode: 'HJ',
    options: {
      A: 'I chase it — opportunities like this are rare.',
      B: 'I feel frustrated but wait for the next setup.',
      C: 'I review my process to see if I missed a signal.',
    },
  },
  {
    prompt: 'A trusted analyst contradicts your current trade thesis. You:',
    dimension: 'Independent Thinking',
    dimensionCode: 'IT',
    options: {
      A: 'Immediately reconsider and possibly exit.',
      B: 'Weigh their view but stick to my original plan.',
      C: 'Ignore it — I did my own research.',
    },
  },
  {
    prompt: 'How far ahead do you typically plan your trades?',
    dimension: 'Long-term Focus',
    dimensionCode: 'LF',
    options: {
      A: 'Hours to a day — I trade short-term momentum.',
      B: 'Days to weeks — I look for swing opportunities.',
      C: 'Months to years — I invest in fundamentals.',
    },
  },
  {
    prompt: 'After a string of losing trades, you tend to:',
    dimension: 'Psychological Resilience',
    dimensionCode: 'PA',
    options: {
      A: 'Take a break and step away from the market.',
      B: 'Trade smaller to rebuild confidence gradually.',
      C: 'Trade more aggressively to recover losses faster.',
    },
  },
];

const DIMENSION_COLORS: Record<string, string> = {
  LE: '#F59E0B',
  HJ: '#3B82F6',
  LF: '#10B981',
  IT: '#8B5CF6',
  PA: '#06B6D4',
};

function getRandomQuestions(count: number): ZenQuestion[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface ZenQuestionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ZenQuestionsModal({ visible, onClose }: ZenQuestionsModalProps) {
  const dark = useColorScheme() === 'dark';
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(ZenQuestionOptionKey | null)[]>(Array(5).fill(null));
  const [completed, setCompleted] = useState(false);
  const questions = useMemo(() => getRandomQuestions(5), []);

  const bg = dark ? '#0D1117' : '#FFFFFF';
  const border = dark ? '#1F2937' : '#E5E7EB';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub = dark ? '#AEB0B4' : '#4B5563';

  const currentQuestion = questions[step];
  const currentAnswer = answers[step];
  const dimColor = DIMENSION_COLORS[currentQuestion?.dimensionCode] ?? WatchlistColors.primary;
  const progress = (step / 5) * 100;

  const handleSelect = (key: ZenQuestionOptionKey) => {
    setAnswers(prev => { const next = [...prev]; next[step] = key; return next; });
  };

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
    else setCompleted(true);
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const handleClose = () => {
    setStep(0);
    setAnswers(Array(5).fill(null));
    setCompleted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: bg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: border }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textMain }}>
            {completed ? 'Reflection Complete' : !user ? 'Trading Mindset' : 'Mindset Reflection'}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={22} color={textSub} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Not logged in */}
          {!user ? (
            <View style={{ alignItems: 'center', gap: 20, paddingTop: 20 }}>
              <Ionicons name="leaf-outline" size={56} color={WatchlistColors.primary} />
              <Text style={{ fontSize: 22, fontWeight: '800', color: textMain, textAlign: 'center' }}>Unlock Your Trading Mindset</Text>
              <Text style={{ fontSize: 14, color: textSub, textAlign: 'center', lineHeight: 22 }}>
                5 short reflections on your emotional habits, decision-making, and resilience — not a test, but a mirror for growth.
              </Text>
              {[
                'Understand your loss tolerance',
                'Reflect on your decision-making patterns',
                'Gauge your independent thinking',
                'Measure your long-term focus',
              ].map(item => (
                <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch' }}>
                  <Ionicons name="sparkles" size={16} color={WatchlistColors.primary} />
                  <Text style={{ fontSize: 14, color: textMain, flex: 1 }}>{item}</Text>
                </View>
              ))}
              <TouchableOpacity onPress={handleClose}
                style={{ backgroundColor: WatchlistColors.primary, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Log in to Begin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose}>
                <Text style={{ fontSize: 14, color: textSub }}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          ) : completed ? (
            /* Completion */
            <View style={{ alignItems: 'center', gap: 20, paddingTop: 20 }}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={{ fontSize: 22, fontWeight: '800', color: textMain, textAlign: 'center' }}>Reflection Complete</Text>
              <Text style={{ fontSize: 14, color: textSub, textAlign: 'center', lineHeight: 22 }}>
                Your reflections help shape a more personalized experience as you trade and grow. Keep these insights in mind as you make decisions.
              </Text>
              <TouchableOpacity onPress={handleClose}
                style={{ backgroundColor: WatchlistColors.primary, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Continue Trading</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Questions */
            <View style={{ gap: 20 }}>
              {/* Progress */}
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: textSub }}>Question {step + 1} of 5</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: `${dimColor}22`, borderWidth: 1, borderColor: `${dimColor}55` }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: dimColor }}>{currentQuestion.dimension}</Text>
                  </View>
                </View>
                {/* Progress bar */}
                <View style={{ height: 4, borderRadius: 2, backgroundColor: dark ? '#1F2937' : '#E5E7EB' }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: dimColor, width: `${progress}%` }} />
                </View>
              </View>

              {/* Question */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: textMain, lineHeight: 24 }}>
                {currentQuestion.prompt}
              </Text>

              {/* Options */}
              {(['A', 'B', 'C'] as ZenQuestionOptionKey[]).map(key => {
                const isSelected = currentAnswer === key;
                return (
                  <TouchableOpacity key={key} onPress={() => handleSelect(key)}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: isSelected ? dimColor : border, backgroundColor: isSelected ? `${dimColor}15` : 'transparent' }}>
                    <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? dimColor : (dark ? '#1F2937' : '#F3F4F6') }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#fff' : textSub }}>{key}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, color: textMain, lineHeight: 22 }}>{currentQuestion.options[key]}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Navigation */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                {step > 0 && (
                  <TouchableOpacity onPress={handleBack}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: border }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: textSub }}>Back</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleNext} disabled={!currentAnswer}
                  style={{ flex: step > 0 ? 1 : undefined, width: step === 0 ? '100%' : undefined, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: currentAnswer ? WatchlistColors.primary : (dark ? '#1F2937' : '#E5E7EB') }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: currentAnswer ? '#fff' : textSub }}>
                    {step === 4 ? 'Complete' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}