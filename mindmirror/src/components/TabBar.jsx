import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const TabBar = ({ currentTab, setCurrentTab }) => (
  <View style={styles.tabBar}>
    {/* 1. 홈 탭 */}
    <TouchableOpacity onPress={() => setCurrentTab('home')} style={styles.tabItem}>
      <Image 
        source={require('../../assets/home.png')} 
        style={[
          styles.icon, 
          { tintColor: currentTab === 'home' ? '#4F46E5' : '#9CA3AF' }
        ]} 
      />
      <Text style={[styles.tabText, currentTab === 'home' && styles.activeTabText]}>홈</Text>
    </TouchableOpacity>
    
    {/* 2. 글쓰기 버튼 (가운데) */}
    <TouchableOpacity onPress={() => setCurrentTab('write')} style={styles.writeBtnWrapper}>
      <View style={styles.writeBtn}>
        <Image 
          source={require('../../assets/plus.png')} 
          style={styles.plusIcon} 
        />
      </View>
    </TouchableOpacity>

    {/* 3. 리포트 탭 */}
    <TouchableOpacity onPress={() => setCurrentTab('report')} style={styles.tabItem}>
      <Image 
        source={require('../../assets/file.png')} 
        style={[
          styles.icon, 
          { tintColor: currentTab === 'report' ? '#4F46E5' : '#9CA3AF' }
        ]} 
      />
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
  
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  
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
    elevation: 5
  },
  plusIcon: { width: 24, height: 24, tintColor: 'white', resizeMode: 'contain' }
});

export default TabBar;
