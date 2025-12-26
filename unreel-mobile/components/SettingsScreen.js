import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SettingsScreen = ({ navigation }) => {
  const closeSettings = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add settings options here */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>API Configuration</Text>
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>History Management</Text>
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Appearance</Text>
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Terms of Service</Text>
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(16, 16, 28, 0.98)',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
  },
});

export default SettingsScreen;