import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Keyboard, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { analyzeVideo, testConnectivity } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Test connectivity when component mounts
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const result = await testConnectivity();
        console.log('Connectivity test passed:', result);
      } catch (error) {
        console.error('Connectivity test failed:', error);
        Alert.alert('Network Error', 'Unable to connect to the backend server. Please make sure the server is running and you have network connectivity.');
      }
    };
    
    checkConnectivity();
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      // Check if input is a URL
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      
      if (urlPattern.test(inputText)) {
        // It's a URL, analyze the video
        try {
          console.log('Analyzing video:', inputText);
          Keyboard.dismiss();
          
          // Show loading state
          setIsLoading(true);
          
          // Call the API to analyze the video
          const result = await analyzeVideo(inputText);
          console.log('Analysis result:', result);
          
          // Navigate to the analysis result screen
          setIsLoading(false);
          navigation.navigate('AnalysisResult', { analysisData: result });
        } catch (error) {
          console.error('Analysis failed:', error);
          setIsLoading(false);
          Alert.alert('Analysis Failed', `${error.message || 'Failed to analyze the video. Please try again.'}\n\nPlease make sure the backend server is running and you have a stable internet connection.`);
        }
      } else {
        // It's a chat message
        console.log('Sending chat message:', inputText);
        // TODO: Implement chat functionality
        Keyboard.dismiss();
      }
      
      setInputText('');
    }
  };

  // New function to handle logo tap for clipboard paste
  const handleLogoTap = async () => {
    if (isLoading) return; // Prevent multiple taps during loading
    
    try {
      // Get text from clipboard
      const clipboardText = await Clipboard.getStringAsync();
      
      // Check if clipboard content is a valid URL (simplified validation)
      const isValidUrl = (string) => {
        try {
          if (typeof string !== 'string') return false;
          if (string.length > 2048) return false; // Prevent extremely long strings
          
          // Simple URL validation
          const urlPattern = /^https?:\/\/.+$/;
          return urlPattern.test(string);
        } catch (e) {
          return false;
        }
      };
      
      if (clipboardText && isValidUrl(clipboardText)) {
        // It's a valid URL, analyze the video
        console.log('Pasted video URL:', clipboardText);
        
        // Show loading state
        setIsLoading(true);
        
        // Call the API to analyze the video
        const result = await analyzeVideo(clipboardText);
        console.log('Analysis result:', result);
        
        // Navigate to the analysis result screen
        setIsLoading(false);
        navigation.navigate('AnalysisResult', { analysisData: result });
      } else if (clipboardText) {
        // Clipboard has content but it's not a valid URL
        setIsLoading(false);
        Alert.alert('Invalid URL', 'The copied text is not a valid video URL. Please copy a valid URL and try again.');
      } else {
        // Clipboard is empty
        setIsLoading(false);
        Alert.alert('Clipboard Empty', 'No text found in clipboard. Please copy a video URL and try again.');
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      setIsLoading(false);
      Alert.alert('Error', `${error.message || 'Failed to read clipboard. Please try again.'}\n\nPlease make sure the backend server is running and you have a stable internet connection.`);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    console.log('Suggestion pressed:', suggestion);
    // For suggestions, we might want to pre-fill the input or trigger specific actions
    if (suggestion === "What's the context?") {
      // This might trigger a specific type of analysis
      Alert.alert('Feature Coming Soon', 'Context analysis will be available in a future update.');
    } else if (suggestion === "Translate this video") {
      // This might trigger translation
      Alert.alert('Feature Coming Soon', 'Video translation will be available in a future update.');
    }
  };

  const openHistory = () => {
    navigation.navigate('History');
  };

  const openSettings = () => {
    navigation.navigate('Settings');
  };

  // Show loading screen if processing
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Aurora background effect */}
        <View style={styles.auroraBg}>
          <View style={styles.auroraCircle1} />
          <View style={styles.auroraCircle2} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFFF" />
          <Text style={styles.loadingText}>Fetching video information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Aurora background effect */}
      <View style={styles.auroraBg}>
        <View style={styles.auroraCircle1} />
        <View style={styles.auroraCircle2} />
      </View>
      
      {/* Header with icons */}
      <View style={styles.header}>
        <View style={styles.leftHeaderIcons}>
          <TouchableOpacity onPress={openHistory}>
            <MaterialIcons name="history" size={24} color="#00FFFF" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="bookmark" size={24} color="#00FFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={openSettings}>
          <MaterialIcons name="settings" size={24} color="#00FFFF" />
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.mainContent}>
        <TouchableOpacity onPress={handleLogoTap}>
          <Text style={styles.logo}>UnReel</Text>
        </TouchableOpacity>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionPrimary}>Tap to paste your video link</Text>
          <Text style={styles.instructionSecondary}>and watch the magic unfold</Text>
        </View>
      </View>

      {/* Footer - now empty as per requirements */}
      <View style={styles.footer}>
      </View>

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10101C',
    padding: 24,
    position: 'relative',
  },
  auroraBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#10101C',
    zIndex: 0,
    overflow: 'hidden',
  },
  auroraCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 51, 153, 0.3)', // Violet color with opacity
    top: '15%',
    left: '10%',
  },
  auroraCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 255, 255, 0.2)', // Electric cyan with opacity
    bottom: '5%',
    right: '10%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#EAE8FF',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    zIndex: 20,
  },
  leftHeaderIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: -48,
    zIndex: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: -0.5,
  },
  instructionContainer: {
    gap: 8,
  },
  instructionPrimary: {
    fontSize: 18,
    fontWeight: '300',
    color: '#EAE8FF',
  },
  instructionSecondary: {
    fontSize: 16,
    fontWeight: '300',
    color: '#D1D5DB',
    opacity: 0.8,
  },
  footer: {
    paddingBottom: 24,
    zIndex: 10,
  },
});

export default HomeScreen;