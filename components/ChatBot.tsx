import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function ChatBot() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Hi! I'm your Anode assistant. Ask me anything about your trades or the market.",
    },
  ]);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // TODO: replace with real API call
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "I'm still learning! This feature is coming soon.",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Ionicons name="sparkles" size={20} color={dark ? "#00E5A0" : "#00A372"} />
              <Text style={s.headerTitle}>Anode Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={24} color={dark ? "#EEEEEF" : "#111827"} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View
                style={[
                  s.messageBubble,
                  item.role === "user" ? s.userBubble : s.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    s.messageText,
                    item.role === "user" ? s.userText : s.assistantText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
          />

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about your trades..."
                placeholderTextColor={dark ? "#555" : "#999"}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 90,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: dark ? "#00E5A0" : "#00A372",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      zIndex: 999,
    },
    container: {
      flex: 1,
      backgroundColor: dark ? "#050B14" : "#F3F4F6",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? "#1A1A2E" : "#E5E7EB",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: dark ? "#EEEEEF" : "#111827",
    },
    messageList: {
      padding: 16,
      gap: 12,
    },
    messageBubble: {
      maxWidth: "80%",
      borderRadius: 16,
      padding: 12,
    },
    userBubble: {
      alignSelf: "flex-end",
      backgroundColor: dark ? "#00E5A0" : "#00A372",
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      alignSelf: "flex-start",
      backgroundColor: dark ? "#0F1923" : "#FFFFFF",
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: {
      color: "#FFFFFF",
    },
    assistantText: {
      color: dark ? "#EEEEEF" : "#111827",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: dark ? "#1A1A2E" : "#E5E7EB",
    },
    input: {
      flex: 1,
      backgroundColor: dark ? "#0F1923" : "#FFFFFF",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: dark ? "#EEEEEF" : "#111827",
      borderWidth: 1,
      borderColor: dark ? "#1A1A2E" : "#E5E7EB",
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: dark ? "#00E5A0" : "#00A372",
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      opacity: 0.4,
    },
  });