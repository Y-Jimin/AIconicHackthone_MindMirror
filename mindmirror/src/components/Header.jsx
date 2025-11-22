import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
        <ChevronLeft size={24} color="#4B5563" />
      </TouchableOpacity>
    ) : (
      <View style={{ width: 24 }} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const styles = StyleSheet.create({
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  headerBtn: { padding: 4 },
});

export default Header;