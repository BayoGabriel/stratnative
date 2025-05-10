import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InboxIcon,
  UserCircleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const History = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterActive, setFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Animation values
  const filterHeight = useSharedValue(0);

  useEffect(() => {
    fetchUserTasks();
  }, [user, token]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.type === activeFilter || task.status === activeFilter));
    }
  }, [activeFilter, tasks]);

  const fetchUserTasks = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const response = await fetch('https://stratoliftapp.vercel.app/api/tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
      }

      setTasks(data.data);
      setFilteredTasks(data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = () => {
    setFilterActive(!filterActive);
    filterHeight.value = withTiming(filterActive ? 0 : 60);
  };

  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filterHeight.value,
      overflow: 'hidden',
    };
  });

  const getIconForTaskType = (type) => {
    switch (type) {
      case 'service':
        return <UserCircleIcon size={24} color="#6B7280" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon size={24} color="#3B82F6" />;
      case 'sos':
        return <Image
                source={require('../assets/stuck.png')}
              />;;
      default:
        return <InboxIcon size={24} color="#6B7280" />;
    }
  };

  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'service':
        return ['#4B5563', '#6B7280'];
      case 'maintenance':
        return ['#2563EB', '#3B82F6'];
      case 'sos':
        return ['#D97706', '#F59E0B'];
      default:
        return ['#6B7280', '#9CA3AF'];
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-gray-100', text: 'text-gray-500', icon: <ClockIcon size={12} color="#6B7280" /> };
      case 'in-progress':
      case 'assigned':
        return { bg: 'bg-orange-100', text: 'text-orange-500', icon: <ArrowPathIcon size={12} color="#F97316" /> };
      case 'completed':
      case 'resolved':
        return { bg: 'bg-green-100', text: 'text-green-500', icon: <InboxIcon size={12} color="#22C55E" /> };
      case 'unresolved':
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-primary', icon: <ExclamationTriangleIcon size={12} color="#EF4444" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <ClockIcon size={12} color="#6B7280" /> };
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays}d ago`;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-600';
      case 'medium':
        return 'bg-green-100 text-green-600';
      case 'high':
        return 'bg-orange-100 text-orange-600';
      case 'urgent':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const navigateToTaskDetail = (taskId) => {
    navigation.navigate('taskdetail', { taskId });
  };

  const renderTaskItem = ({ item, index }) => {
    const statusBadge = getStatusBadge(item.status);
    const [primaryColor, secondaryColor] = getTaskTypeColor(item.type);
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()} 
        className="mb-3"
      >
        <Pressable
          onPress={() => navigateToTaskDetail(item._id)}
          className="bg-white rounded-xl overflow-hidden shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View 
                  className="w-8 h-8 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  {getIconForTaskType(item.type)}
                </View>
                <View>
                  <Text className="text-sm text-gray-500 capitalize">{item.type}</Text>
                  <Text className="text-xs text-gray-400">{item.taskId}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className={`py-1 px-2.5 rounded-full flex-row items-center ${statusBadge.bg}`}>
                  <View className="mr-1">{statusBadge.icon}</View>
                  <Text className={`text-xs font-medium ${statusBadge.text} capitalize`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-base font-bold text-gray-800">{item.title}</Text>
              <Text numberOfLines={2} className="text-sm text-gray-500 mt-1">
                {item.description}
              </Text>
            </View>

            <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-400">{formatDate(item.createdAt)}</Text>
                <View className="bg-gray-200 w-1 h-1 rounded-full mx-2" />
                <Text className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</Text>
              </View>
              
              <View className={`py-1 px-2 rounded-md ${getPriorityColor(item.priority).split(' ')[0]}`}>
                <Text className={`text-xs ${getPriorityColor(item.priority).split(' ')[1]} capitalize`}>
                  {item.priority}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View className="bg-gray-50 rounded-xl p-8 items-center justify-center mt-4">
      <Image
        source={require('../assets/no-activity.png')}
        style={{ width: width * 0.25, height: width * 0.25, marginBottom: 16 }}
        resizeMode="contain"
      />
      <Text className="text-gray-500 text-center mb-2">No tasks available</Text>
      <Text className="text-gray-400 text-xs text-center mb-4">
        You don't have any elevator service history yet
      </Text>
      <Pressable 
        onPress={() => navigation.navigate('userreport')}
        className="mt-3 bg-red-600 py-3 px-5 rounded-lg"
      >
        <Text className="text-white font-medium">Create a Request</Text>
      </Pressable>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-4">
      <LinearGradient
        colors={['#f5f5f5', '#fff']}
        className="rounded-xl p-5"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold">Elevator History</Text>
            <Text className="text-gray-500 text-sm">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'request' : 'requests'} found
            </Text>
          </View>
          <Pressable 
            onPress={toggleFilter}
            className={`w-10 h-10 rounded-full justify-center items-center ${filterActive ? 'bg-primary' : 'bg-gray-100'}`}
          >
            <AdjustmentsHorizontalIcon size={20} color={filterActive ? '#fff' : '#6B7280'} />
          </Pressable>
        </View>
      
        <Animated.View style={filterAnimatedStyle}>
          <View className="flex-row justify-between mb-2">
            <ScrollableFilterChips 
              filters={[
                { id: 'all', label: 'All' },
                { id: 'service', label: 'Service' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'sos', label: 'SOS' },
                { id: 'completed', label: 'Completed' },
                { id: 'pending', label: 'Pending' },
              ]}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <StatusBar style="dark" />
      
      <View className="flex-1 px-4 pt-2">
        {loading ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center mt-4">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-gray-500 mt-2">Loading history...</Text>
          </View>
        ) : error ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center mt-4">
            <ExclamationTriangleIcon size={32} color="#EF4444" />
            <Text className="text-gray-500 mt-2">Failed to load tasks</Text>
            <Pressable onPress={fetchUserTasks} className="mt-3 bg-red-100 py-2 px-4 rounded-lg">
              <Text className="text-primary">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTaskItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      {Platform.OS === 'ios' ? (
                <View 
                className="flex-row justify-around items-center border-t border-gray-200 py-3 bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <Pressable onPress={() => navigation.navigate('userdb')} className="items-center px-3">
                  <HomeIcon size={22} color="#9CA3AF" />
                  <Text className="text-xs mt-1 text-gray-500 font-geist">Home</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('blog')} className="items-center px-3">
                  <DocumentTextIcon size={22} color="#9CA3AF" />
                  <Text className="text-xs mt-1 text-gray-500 font-geist">Blog</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('history')} className="items-center px-3">
                  <ClockIcon size={22} color="#EC3237" />
                  <Text className="text-xs mt-1 text-primary font-geist-semibold">History</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('profile')} className="items-center px-3">
                  <UserIcon size={22} color="#9CA3AF" />
                  <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
                </Pressable>
              </View>
      ) : (
        <View 
          className="flex-row justify-around items-center border-t border-gray-200 py-3 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 5,
          }}
        >
          <Pressable onPress={() => navigation.navigate('userdb')} className="items-center px-3">
            <HomeIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">Home</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('blog')} className="items-center px-3">
            <DocumentTextIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">Blog</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('history')} className="items-center px-3">
            <ClockIcon size={22} color="#EC3237" />
            <Text className="text-xs mt-1 text-primary font-geist-semibold">History</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('profile')} className="items-center px-3">
            <UserIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const ScrollableFilterChips = ({ filters, activeFilter, setActiveFilter }) => {
  return (
    <FlatList
      data={filters}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => setActiveFilter(item.id)}
          className={`px-4 py-2 rounded-full mr-2 ${
            activeFilter === item.id ? 'bg-primary' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-sm ${
              activeFilter === item.id ? 'text-white font-bold' : 'text-gray-600'
            }`}
          >
            {item.label}
          </Text>
        </Pressable>
      )}
    />
  );
};



export default History;