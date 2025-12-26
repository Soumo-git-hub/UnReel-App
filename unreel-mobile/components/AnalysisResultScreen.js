import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { translateTranscript } from '../services/api';

const AnalysisResultScreen = ({ route, navigation }) => {
  // Extract data from route params
  const { analysisData } = route.params || {};

  // State for collapsible transcript
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState({});

  // For now, we'll use mock data if no data is provided
  const mockData = {
    title: "Introduction to React Native",
    summary: "This video provides a comprehensive introduction to React Native, covering the basics of building cross-platform mobile applications. It explains core concepts like components, state management, and navigation.",
    keyTopics: ["React Native Basics", "Components", "State Management", "Navigation"],
    mentionedResources: [
      { type: "Documentation", name: "React Native Official Docs" },
      { type: "Tool", name: "Expo CLI" },
      { type: "Library", name: "React Navigation" }
    ],
    translation: "Cette vidéo fournit une introduction complète à React Native, couvrant les bases de la création d'applications mobiles multiplateformes. Elle explique les concepts fondamentaux comme les composants, la gestion d'état et la navigation.",
    fullTranscript: "This is a sample transcript of the video content. It would contain the full text of what was said in the video. This transcript is used to generate the summary and can be translated into different languages."
  };

  // Handle the actual data structure from the backend
  const data = analysisData ? {
    ...analysisData,
    ...(analysisData.content || {}), // Merge content properties to the top level
    title: analysisData.metadata?.title || "Untitled Video",
    keyTopics: Array.isArray(analysisData.content?.keyTopics) ? analysisData.content.keyTopics : [],
    mentionedResources: Array.isArray(analysisData.content?.mentionedResources) ? analysisData.content.mentionedResources : [],
    summary: analysisData.content?.summary || "",
    translation: analysisData.content?.translation || "",
    fullTranscript: analysisData.fullTranscript || "",
    detectedLanguage: analysisData.detectedLanguage || "en",
    supportedLanguages: analysisData.supportedLanguages || {
      'hi': 'Hindi',
      'ta': 'Tamil', 
      'te': 'Telugu',
      'bn': 'Bengali',
      'mr': 'Marathi',
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese'
    }
  } : mockData;

  // Set supported languages when data loads
  useEffect(() => {
    if (data.supportedLanguages) {
      setSupportedLanguages(data.supportedLanguages);
      // Set default selected language to the detected language if available
      if (data.detectedLanguage && data.supportedLanguages[data.detectedLanguage]) {
        setSelectedLanguage(data.detectedLanguage);
      } else if (data.supportedLanguages['en']) {
        // Otherwise default to English
        setSelectedLanguage('en');
      } else {
        // Otherwise use the first available language
        const firstLang = Object.keys(data.supportedLanguages)[0];
        if (firstLang) {
          setSelectedLanguage(firstLang);
        }
      }
    }
  }, [data.supportedLanguages, data.detectedLanguage]);

  const handleChatPress = () => {
    navigation.navigate('Chat', { analysisId: data.analysisId || 'mock-id' });
  };

  // Handle language selection change for transcript translation
  const handleTranscriptLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    
    // If selecting the original language, show the original transcript
    if (languageCode === data.detectedLanguage || languageCode === 'en') {
      setTranslatedTranscript('');
      return;
    }
    
    // Translate the transcript
    try {
      setIsTranslating(true);
      const result = await translateTranscript(data.analysisId, languageCode);
      setTranslatedTranscript(result.translatedText);
    } catch (error) {
      console.error('Transcript translation failed:', error);
      Alert.alert('Translation Error', error.message || 'Failed to translate transcript. Please try again.');
      setTranslatedTranscript('');
    } finally {
      setIsTranslating(false);
    }
  };

  // Safe mapping functions to handle undefined arrays
  const renderKeyTopics = () => {
    if (!data.keyTopics || !Array.isArray(data.keyTopics)) {
      return null;
    }
    
    return (
      <View style={styles.tagContainer}>
        {data.keyTopics.map((topic, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{String(topic)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMentionedResources = () => {
    if (!data.mentionedResources || !Array.isArray(data.mentionedResources)) {
      return null;
    }
    
    return data.mentionedResources.map((resource, index) => {
      // Handle different data structures for resources
      let resourceType = 'Resource';
      let resourceName = 'Unnamed Resource';
      
      // Handle object format
      if (typeof resource === 'object' && resource !== null) {
        if (resource.type) {
          resourceType = resource.type;
        }
        if (resource.name) {
          resourceName = resource.name;
        }
        // Handle array format
        if (Array.isArray(resource) && resource.length >= 2) {
          resourceType = resource[0];
          resourceName = resource[1];
        }
      } else {
        // Handle string format
        resourceName = String(resource);
      }
      
      return (
        <View key={index} style={styles.resourceItem}>
          <View style={styles.resourceTypeContainer}>
            <Text style={styles.resourceType}>{String(resourceType)}</Text>
          </View>
          <Text style={styles.resourceName}>{String(resourceName)}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <Text style={styles.sectionContent}>{data.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionContent}>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Topics</Text>
          {renderKeyTopics()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentioned Resources</Text>
          {renderMentionedResources()}
        </View>

        {/* Collapsible Transcript Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.collapsibleHeader} 
            onPress={() => setIsTranscriptVisible(!isTranscriptVisible)}
          >
            <Text style={styles.sectionTitle}>Video Transcript</Text>
            <MaterialIcons 
              name={isTranscriptVisible ? "expand-less" : "expand-more"} 
              size={24} 
              color="#00FFFF" 
            />
          </TouchableOpacity>
          
          {isTranscriptVisible && (
            <View style={styles.transcriptContainer}>
              {/* Display the exact transcript content as provided by the backend */}
              <Text style={styles.transcriptContent}>
                {data.fullTranscript || "No transcript available."}
              </Text>
            </View>
          )}
        </View>

        {/* Collapsible Translation Section with Language Selection */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.collapsibleHeader} 
            onPress={() => setIsTranslationVisible(!isTranslationVisible)}
          >
            <Text style={styles.sectionTitle}>Translate Transcript</Text>
            <MaterialIcons 
              name={isTranslationVisible ? "expand-less" : "expand-more"} 
              size={24} 
              color="#00FFFF" 
            />
          </TouchableOpacity>
          
          {isTranslationVisible && (
            <View style={styles.transcriptContainer}>
              {/* Language Selection for Translation */}
              <View style={styles.transcriptHeader}>
                <Text style={styles.transcriptSectionTitle}>Select Language</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLanguage}
                    style={styles.picker}
                    onValueChange={handleTranscriptLanguageChange}
                    enabled={!isTranslating}
                  >
                    {Object.entries(supportedLanguages).map(([code, name]) => (
                      <Picker.Item key={code} label={name} value={code} />
                    ))}
                  </Picker>
                  {isTranslating && (
                    <View style={styles.loadingIndicator}>
                      <ActivityIndicator size="small" color="#00FFFF" />
                    </View>
                  )}
                </View>
              </View>
              
              {/* Translated Transcript Content */}
              <Text style={styles.transcriptContent}>
                {translatedTranscript || "Select a language to translate the transcript."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
        <MaterialIcons name="chat" size={20} color="white" />
        <Text style={styles.chatButtonText}>Chat About This Video</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#EAE8FF',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  resourceTypeContainer: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  resourceType: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resourceName: {
    flex: 1,
    color: '#EAE8FF',
    fontSize: 16,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transcriptContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transcriptSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  picker: {
    flex: 1,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  transcriptContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#EAE8FF',
  },
  chatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AnalysisResultScreen;
