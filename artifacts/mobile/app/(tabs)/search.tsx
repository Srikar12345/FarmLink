import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/ListingCard';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_PROMPTS = [
  'Fresh tomatoes nearby',
  'Sweet mangoes today',
  'Organic leafy greens',
  'Red globe grapes',
  'Herbs and coriander',
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { listings } = useApp();

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: "Hi! Tell me what fresh produce you're looking for. I'll find the best listings from local farmers for you.",
    },
  ]);
  const [results, setResults] = useState(listings.slice(0, 3));
  const [searched, setSearched] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const doSearch = (text: string) => {
    const q = text.toLowerCase().trim();
    if (!q) return;

    const found = listings.filter(
      (l) =>
        l.produceName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        q.includes(l.produceName.toLowerCase()) ||
        q.includes(l.category)
    );

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const replyMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text:
        found.length > 0
          ? `Found ${found.length} listing${found.length > 1 ? 's' : ''} for "${text}". Here's what's available fresh from farmers near you:`
          : `I couldn't find "${text}" right now. Try searching for tomatoes, grapes, mangoes, spinach, coriander, or rice. More farmers are joining daily!`,
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setResults(found);
    setSearched(true);
    setQuery('');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Discover</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Find exactly what you need from local farms
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          searched && results.length > 0 ? (
            <View style={styles.resultsContainer}>
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          ) : !searched ? (
            <View style={styles.quickSection}>
              <Text style={[styles.quickTitle, { color: colors.mutedForeground }]}>
                Try searching for
              </Text>
              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    style={[styles.quickChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    onPress={() => doSearch(prompt)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="magnify" size={13} color={colors.primary} />
                    <Text style={[styles.quickText, { color: colors.primary }]}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user'
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
            ]}
          >
            {item.role === 'assistant' && (
              <View style={[styles.botAvatar, { backgroundColor: colors.primary + '20' }]}>
                <MaterialCommunityIcons name="leaf" size={14} color={colors.primary} />
              </View>
            )}
            <Text
              style={[
                styles.bubbleText,
                { color: item.role === 'user' ? '#fff' : colors.foreground },
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="What are you looking for?"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => doSearch(query)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: query.trim() ? colors.primary : colors.muted }]}
          onPress={() => doSearch(query)}
          disabled={!query.trim()}
        >
          <Feather name="arrow-up" size={18} color={query.trim() ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  chatList: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4 },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, flex: 1 },
  resultsContainer: { marginTop: 8 },
  quickSection: { marginTop: 16, gap: 10 },
  quickTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
