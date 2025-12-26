import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Keyboard, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { chatAboutVideo } from '../services/api';

const ChatScreen = ({ route, navigation }) => {
  const { analysisId } = route.params || {};
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. Ask me anything about the video you just analyzed.',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() && !isSending) {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsSending(true);
      const userText = inputText;
      setInputText('');
      Keyboard.dismiss();
      
      try {
        // Call the API to get AI response
        const response = await chatAboutVideo(analysisId, userText);
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Chat failed:', error);
        Alert.alert('Chat Failed', error.message || 'Failed to get response from AI. Please try again.');
        
        // Add error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    
    // Safely format timestamp
    let timestampText = '';
    try {
      if (item.timestamp instanceof Date) {
        timestampText = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (typeof item.timestamp === 'string') {
        const date = new Date(item.timestamp);
        timestampText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        timestampText = '';
      }
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      timestampText = '';
    }
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.aiMessageBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {typeof item.text === 'string' ? item.text : JSON.stringify(item.text)}
          </Text>
        </View>
        {timestampText ? (
          <Text style={styles.timestamp}>
            {timestampText}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#D1D5DB"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          editable={!isSending}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isSending || !inputText.trim()}>
          <MaterialIcons name="send" size={24} color={isSending || !inputText.trim() ? '#D1D5DB' : "#00FFFF"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10101C',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.5,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  userMessageBubble: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#EAE8FF',
  },
  timestamp: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    position: 'relative',
    minHeight: 50,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 48,
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});

export default ChatScreen;