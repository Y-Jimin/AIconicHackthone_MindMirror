import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, PenTool, BarChart2 } from 'lucide-react-native';

const TabBar = ({ currentTab, setCurrentTab }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity onPress={() => setCurrentTab('home')} style={styles.tabItem}>
      <Home size={24} color={currentTab === 'home' ? '#4F46E5' : '#9CA3AF'} />
      <Text style={[styles.tabText, currentTab === 'home' && styles.activeTabText]}>홈</Text>
    </TouchableOpacity>
    
    <TouchableOpacity onPress={() => setCurrentTab('write')} style={styles.writeBtnWrapper}>
      <View style={styles.writeBtn}>
        <PenTool size={24} color="white" />
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setCurrentTab('report')} style={styles.tabItem}>
      <BarChart2 size={24} color={currentTab === 'report' ? '#4F46E5' : '#9CA3AF'} />
      <Text style={[styles.tabText, currentTab === 'report' && styles.activeTabText]}>리포트</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  tabBar: { 
    flexDirection: 'row', 
    height: 70, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingBottom: 20, 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { fontSize: 10, marginTop: 4, color: '#9CA3AF', fontWeight: '500' },
  activeTabText: { color: '#4F46E5' },
  writeBtnWrapper: { top: -20 },
  writeBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#4F46E5', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#4F46E5', 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 8,
    elevation: 5
  },
});

export default TabBar;