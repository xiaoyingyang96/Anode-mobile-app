import { Image } from 'expo-image';
import React from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { WatchlistColors } from '@/constants/theme';
import TokenIcon from '@/components/explore/TokenIcon';
import { NewsStory } from '@/types/explore';

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SectionTitle({ title, dark }: { title: string; dark: boolean }) {
  return (
    <View style={sectionTitleStyles(dark).row}>
      <View style={sectionTitleStyles(dark).bar} />
      <Text style={sectionTitleStyles(dark).text}>{title}</Text>
    </View>
  );
}

const sectionTitleStyles = (dark: boolean) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    bar: {
      width: 4,
      height: 16,
      borderRadius: 2,
      backgroundColor: WatchlistColors.primary,
    },
    text: {
      fontSize: 14,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
  });

interface NewsDetailModalProps {
  story: NewsStory | null;
  onClose: () => void;
}

export default function NewsDetailModal({
  story,
  onClose,
}: NewsDetailModalProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  if (!story) return null;

  const tokenEntries = story.crypto_assets
    ? Object.entries(story.crypto_assets)
    : [];

  const sentiment = story.naive_class ?? 0;
  const sentimentColor =
    sentiment === 1
      ? dark ? '#07CDA5' : '#059669'
      : sentiment === -1
        ? dark ? '#FA3364' : '#DC2626'
        : dark ? '#F59E0B' : '#D97706';

  const openArticle = () => {
    if (story.url) Linking.openURL(story.url);
  };

  return (
    <Modal
      visible={!!story}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={s.root}>
        {/* Header bar */}
        <View style={s.header}>
          <View style={[s.sentimentDot, { backgroundColor: sentimentColor }]} />
          <Text style={s.headerPublisher} numberOfLines={1}>
            {story.publisher ?? 'News'}
          </Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={12}>
            <Ionicons
              name="close"
              size={22}
              color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Token icons */}
          {tokenEntries.length > 0 && (
            <View style={s.tokensRow}>
              {tokenEntries.map(([, symbol], i) => (
                <View
                  key={symbol}
                  style={[s.tokenWrapper, { marginLeft: i === 0 ? 0 : -8 }]}
                >
                  <TokenIcon symbol={symbol} size={24} />
                </View>
              ))}
            </View>
          )}

          {/* Title + publisher badge */}
          <TouchableOpacity onPress={openArticle} activeOpacity={0.8}>
            <Text style={s.title}>{story.title}</Text>
          </TouchableOpacity>

          {/* Source attribution */}
          <View style={s.metaRow}>
            {story.publisher && (
              <View style={s.publisherBadge}>
                <Text style={s.publisherText}>{story.publisher}</Text>
              </View>
            )}
            {story.published_at && (
              <Text style={s.dateText}>
                {formatDateTime(story.published_at)}
              </Text>
            )}
          </View>

          {/* Featured image */}
          {story.image_url ? (
            <Image
              source={{ uri: story.image_url }}
              style={s.image}
              contentFit="cover"
            />
          ) : null}

          {/* Key Takeaways */}
          {story.takeaways && story.takeaways.length > 0 && (
            <View style={s.section}>
              <SectionTitle title="Key Takeaways" dark={dark} />
              <View style={s.takeawaysBox}>
                {story.takeaways.map(
                  (takeaway, i) =>
                    takeaway ? (
                      <View key={i} style={s.takeawayRow}>
                        <View style={s.takeawayBadge}>
                          <Text style={s.takeawayNum}>{i + 1}</Text>
                        </View>
                        <Text style={s.takeawayText}>{takeaway}</Text>
                      </View>
                    ) : null
                )}
              </View>
            </View>
          )}

          {/* Summary */}
          {story.summary ? (
            <View style={s.section}>
              <SectionTitle title="Summary" dark={dark} />
              <Text style={s.bodyText}>{story.summary}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <View style={s.section}>
              <SectionTitle title="Related Tags" dark={dark} />
              <View style={s.tagsRow}>
                {story.tags.map((tag) => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reference Sources */}
          {story.sources && story.sources.length > 0 && (
            <View style={s.section}>
              <SectionTitle title="Reference Sources" dark={dark} />
              <View style={s.sourcesBox}>
                {story.sources.map((src, i) => {
                  let hostname: string;
                  try {
                    hostname = new URL(src).hostname.replace('www.', '');
                  } catch {
                    return null;
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={s.sourceRow}
                      onPress={() => Linking.openURL(src)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="open-outline"
                        size={14}
                        color={WatchlistColors.primary}
                      />
                      <View style={s.sourceTextCol}>
                        <Text style={s.sourceHostname}>{hostname}</Text>
                        <Text style={s.sourceUrl} numberOfLines={1}>
                          {src}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Read Full Article button */}
          {story.url && (
            <TouchableOpacity
              style={s.readBtn}
              onPress={openArticle}
              activeOpacity={0.85}
            >
              <Ionicons
                name="open-outline"
                size={16}
                color={WatchlistColors.primary}
              />
              <Text style={s.readBtnText}>Read Full Article</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: dark ? '#050B14' : '#F3F4F6',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      gap: 8,
    },
    sentimentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    headerPublisher: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    closeBtn: {
      padding: 4,
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 40,
    },
    tokensRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenWrapper: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: dark ? '#050B14' : '#F3F4F6',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 26,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    publisherBadge: {
      backgroundColor: dark ? '#1F2937' : '#E5E7EB',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    publisherText: {
      fontSize: 11,
      fontWeight: '600',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    dateText: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    section: { gap: 0 },
    takeawaysBox: {
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      padding: 10,
      gap: 10,
    },
    takeawayRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    takeawayBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: WatchlistColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    takeawayNum: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    takeawayText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 19,
    },
    bodyText: {
      fontSize: 14,
      color: dark ? '#D1D5DB' : '#374151',
      lineHeight: 22,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: WatchlistColors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      fontSize: 12,
      color: WatchlistColors.primary,
      fontWeight: '500',
    },
    sourcesBox: {
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      overflow: 'hidden',
    },
    sourceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    sourceTextCol: {
      flex: 1,
      minWidth: 0,
    },
    sourceHostname: {
      fontSize: 12,
      fontWeight: '600',
      color: WatchlistColors.primary,
    },
    sourceUrl: {
      fontSize: 10,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      marginTop: 2,
    },
    readBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: WatchlistColors.primary,
      paddingVertical: 12,
      marginTop: 8,
    },
    readBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: WatchlistColors.primary,
    },
  });
