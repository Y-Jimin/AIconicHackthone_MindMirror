import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabBar = ({ currentTab, setCurrentTab }) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        onPress={() => setCurrentTab('home')}
        style={styles.tabItem}
      >
        <Ionicons
          name="home"
          size={24}
          color={currentTab === 'home' ? '#4F46E5' : '#9CA3AF'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'home' && styles.tabLabelActive,
          ]}
        >
          홈
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setCurrentTab('write')}
        style={styles.writeButton}
      >
        <Ionicons name="create" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setCurrentTab('report')}
        style={styles.tabItem}
      >
        <Ionicons
          name="bar-chart"
          size={24}
          color={currentTab === 'report' ? '#4F46E5' : '#9CA3AF'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'report' && styles.tabLabelActive,
          ]}
        >
          리포트
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#4F46E5',
  },
  writeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TabBar;
