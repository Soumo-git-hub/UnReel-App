import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getAnalysisHistory } from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await getAnalysisHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('Error', 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadHistory();
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all analysis history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setHistory([]) }
      ]
    );
  };

  const handleAnalysisPress = (analysis) => {
    navigation.navigate('AnalysisResult', { analysisData: analysis });
  };

  // For now, we'll use mock data since the backend doesn't have a history endpoint yet
  const mockHistory = [
    {
      id: '1',
      title: 'Introduction to React Native',
      url: 'https://example.com/video1',
      date: new Date('2023-05-15'),
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      url: 'https://example.com/video2',
      date: new Date('2023-05-10'),
    },
    {
      id: '3',
      title: 'Building REST APIs with Node.js',
      url: 'https://example.com/video3',
      date: new Date('2023-05-05'),
    },
  ];

  const historyData = history.length > 0 ? history : mockHistory;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <MaterialIcons name="refresh" size={20} color="#00FFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearHistory} style={styles.headerButton}>
            <MaterialIcons name="delete" size={20} color="#00FFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : historyData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No analysis history yet</Text>
          <Text style={styles.emptySubtext}>Analyze a video to see it appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {historyData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => handleAnalysisPress(item)}
            >
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.historyItemUrl} numberOfLines={1}>
                  {item.url}
                </Text>
                <Text style={styles.historyItemDate}>
                  {item.date.toLocaleDateString()}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#EAE8FF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#EAE8FF',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemContent: {
    flex: 1,
    marginRight: 12,
  },
  historyItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyItemUrl: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  historyItemDate: {
    color: '#D1D5DB',
    fontSize: 12,
    opacity: 0.8,
  },
});

export default HistoryScreen;