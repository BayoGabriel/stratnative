import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  RefreshControl
} from 'react-native';
import {
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BarsArrowUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const TechnicianTasks = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  // Animation values
  const filterAnimation = useRef(new Animated.Value(-600)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  // List of priorities
  const priorities = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  useEffect(() => {
    // Animate list appearance
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate header appearance
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchTechnicianTasks();
  }, [user, token]);

  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilter, searchQuery, selectedPriority, sortOrder]);

  const fetchTechnicianTasks = async () => {
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
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...tasks];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'pending') {
        result = result.filter(task => task.status === 'pending' || task.status === 'assigned');
      } else if (activeFilter === 'in-progress') {
        result = result.filter(task => task.status === 'in-progress');
      } else if (activeFilter === 'completed') {
        result = result.filter(task => task.status === 'completed' || task.status === 'resolved');
      }
    }
    
    // Apply priority filter
    if (selectedPriority !== 'all') {
      result = result.filter(task => task.priority === selectedPriority);
    }
    
    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        (task.taskId && task.taskId.toLowerCase().includes(query))
      );
    }
    
    // Apply sort order
    if (sortOrder === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      result.sort((a, b) => 
        (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
      );
    }
    
    setFilteredTasks(result);
  };

  const toggleFilters = () => {
    if (showFilters) {
      // Hide filters
      Animated.spring(filterAnimation, {
        toValue: -600,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => setShowFilters(false));
    } else {
      // Show filters
      setShowFilters(true);
      Animated.spring(filterAnimation, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const getIconForTaskType = (type) => {
    const iconSize = Platform.OS === 'android' ? 22 : 20;
    
    switch (type) {
      case 'service':
        return <UserIcon size={iconSize} color="#6366F1" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon size={iconSize} color="#3B82F6" />;
      case 'sos':
        return <Image
          source={require('../assets/emergency.png')}
          style={{ width: 22, height: 22 }}
        />;
      default:
        return <InboxIcon size={iconSize} color="#6B7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'assigned':
        return 'bg-blue-100 text-blue-600';
      case 'in-progress':
        return 'bg-amber-100 text-amber-600';
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-600';
      case 'unresolved':
      case 'cancelled':
        return 'bg-red-100 text-primary';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-50 text-green-600';
      case 'medium':
        return 'bg-blue-50 text-blue-600';
      case 'high':
        return 'bg-orange-50 text-orange-600';
      case 'urgent':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

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

  const navigateToTaskDetail = (taskId) => {
    navigation.navigate('techniciantaskdetail', { taskId });
  };

  const FilterOption = ({ label, active, onPress }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${active ? 'bg-blue-600' : 'bg-gray-100'}`}
    >
      <Text className={`font-geist-medium text-sm ${active ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <Animated.View 
        style={{ 
          opacity: headerAnimation,
          transform: [{ translateY: headerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0]
          }) }]
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#fafafa']}
          className="pt-14 pb-4 px-5"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-geist-bold text-gray-800">Tasks</Text>
            <Pressable 
              onPress={toggleFilters}
              className="bg-white py-2 px-2 rounded-full flex-row items-center shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <AdjustmentsHorizontalIcon size={20} color="#4B5563" />
            </Pressable>
          </View>
          
          {/* Search */}
          <View className="bg-white rounded-xl flex-row items-center px-3 mb-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <MagnifyingGlassIcon size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search tasks..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 py-3 px-2 text-gray-800 font-geist"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")}>
                <Text className="text-blue-600 font-geist-medium">Clear</Text>
              </Pressable>
            ) : null}
          </View>
          
          {/* Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <FilterOption 
              label="All Tasks" 
              active={activeFilter === 'all'} 
              onPress={() => setActiveFilter('all')} 
            />
            <FilterOption 
              label="Pending" 
              active={activeFilter === 'pending'} 
              onPress={() => setActiveFilter('pending')} 
            />
            <FilterOption 
              label="In Progress" 
              active={activeFilter === 'in-progress'} 
              onPress={() => setActiveFilter('in-progress')} 
            />
            <FilterOption 
              label="Completed" 
              active={activeFilter === 'completed'} 
              onPress={() => setActiveFilter('completed')} 
            />
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Filter Drawer */}
      {showFilters && (
        <Animated.View 
          style={{
            transform: [{ translateX: filterAnimation }],
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: width * 0.8,
            backgroundColor: 'white',
            zIndex: 100,
            padding: 20,
            paddingTop: 60,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10,
          }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-geist-bold text-gray-800">Filter Tasks</Text>
            <Pressable onPress={toggleFilters} className="p-2">
              <Text className="text-blue-600 font-geist-medium">Done</Text>
            </Pressable>
          </View>
          
          {/* Priority Filter */}
          <Text className="text-gray-700 font-geist-semibold mb-3">Priority</Text>
          {priorities.map((priority) => (
            <Pressable 
              key={priority.value}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
              onPress={() => setSelectedPriority(priority.value)}
            >
              <Text className="text-gray-700 font-geist">{priority.label}</Text>
              {selectedPriority === priority.value && (
                <CheckCircleIcon size={20} color="#3B82F6" />
              )}
            </Pressable>
          ))}
          
          {/* Sort Order */}
          <Text className="text-gray-700 font-geist-semibold mb-3 mt-6">Sort By</Text>
          <Pressable 
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => setSortOrder('latest')}
          >
            <Text className="text-gray-700 font-geist">Latest First</Text>
            {sortOrder === 'latest' && <CheckCircleIcon size={20} color="#3B82F6" />}
          </Pressable>
          <Pressable 
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => setSortOrder('oldest')}
          >
            <Text className="text-gray-700 font-geist">Oldest First</Text>
            {sortOrder === 'oldest' && <CheckCircleIcon size={20} color="#3B82F6" />}
          </Pressable>
          <Pressable 
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => setSortOrder('priority')}
          >
            <Text className="text-gray-700 font-geist">Priority (High to Low)</Text>
            {sortOrder === 'priority' && <CheckCircleIcon size={20} color="#3B82F6" />}
          </Pressable>
          
          {/* Reset Filters */}
          <Pressable 
            onPress={() => {
              setSelectedPriority('all');
              setSortOrder('latest');
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="mt-6 bg-gray-100 py-3 rounded-xl"
          >
            <Text className="text-blue-600 font-geist-semibold text-center">Reset All Filters</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Task List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTechnicianTasks();
            }}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        <Animated.View style={{ opacity: listOpacity }} className="px-5 mt-4">
          {loading ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-3 font-geist">Loading tasks...</Text>
            </View>
          ) : error ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm">
              <View className="bg-red-50 p-3 rounded-full mb-2">
                <ExclamationTriangleIcon size={24} color="#EF4444" />
              </View>
              <Text className="text-gray-700 font-geist-bold mb-1">Unable to load tasks</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist">There was a problem connecting to the service</Text>
              <Pressable 
                onPress={fetchTechnicianTasks} 
                className="bg-blue-600 py-2 px-5 rounded-lg"
              >
                <Text className="text-white font-geist-semibold">Try Again</Text>
              </Pressable>
            </View>
          ) : filteredTasks.length > 0 ? (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500 font-geist">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </Text>
                {searchQuery || selectedPriority !== 'all' || activeFilter !== 'all' ? (
                  <Pressable onPress={() => {
                    setSearchQuery('');
                    setSelectedPriority('all');
                    setActiveFilter('all');
                  }}>
                    <Text className="text-blue-600 font-geist-medium">Clear Filters</Text>
                  </Pressable>
                ) : null}
              </View>
              
              {filteredTasks.map((task, index) => (
                <Pressable 
                  key={task._id || index} 
                  onPress={() => navigateToTaskDetail(task._id)}
                  className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row flex-1">
                        <View className="bg-gray-50 p-2.5 rounded-xl mr-3">
                          {getIconForTaskType(task.type)}
                        </View>
                        <View className="flex-1">
                          <Text className="font-geist-semibold text-gray-800 text-base mb-1">
                            {task.title}
                          </Text>
                          <Text numberOfLines={2} className="text-gray-500 text-sm font-geist mb-2">
                            {task.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Task details */}
                    <View className="mt-1">
                      <View className="flex-row flex-wrap mt-2">
                        <View className={`py-1 px-2.5 rounded-full ${getStatusColor(task.status).split(' ')[0]} mr-2 mb-2`}>
                          <Text className={`text-xs font-geist-medium ${getStatusColor(task.status).split(' ')[1]}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Text>
                        </View>
                        
                        {task.priority && (
                          <View className={`py-1 px-2.5 rounded-full ${getPriorityColor(task.priority).split(' ')[0]} mr-2 mb-2`}>
                            <Text className={`text-xs font-geist-medium ${getPriorityColor(task.priority).split(' ')[1]}`}>
                              {task.priority.toUpperCase()}
                            </Text>
                          </View>
                        )}
                        
                        {task.dueDate && (
                          <View className="py-1 px-2.5 rounded-full bg-gray-100 flex-row items-center mr-2 mb-2">
                            <CalendarDaysIcon size={12} color="#6B7280" />
                            <Text className="text-xs font-geist text-gray-600 ml-1">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Bottom info */}
                      <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <View className="flex-row items-center">
                          <Text className="text-gray-500 text-xs font-geist mr-3">
                            ID: {task.taskId || '#12345'}
                          </Text>
                          <Text className="text-gray-500 text-xs font-geist">
                            {formatTimeAgo(task.createdAt)}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          {task.assignedTo && task.assignedTo.firstName && (
                            <Text className="text-gray-500 text-xs font-geist mr-2">
                              {task.assignedTo.firstName + ' ' + task.assignedTo.lastName}
                            </Text>
                          )}
                          <View className="bg-blue-50 rounded-full p-1.5">
                            <ArrowRightIcon size={14} color="#3B82F6" />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm mt-4">
              <Image
                source={require('../assets/no-activity.png')}
                style={{ width: width * 0.25, height: width * 0.25, opacity: 0.8, marginBottom: 16 }}
              />
              <Text className="text-gray-700 font-geist-semibold mb-1">No tasks found</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist">
                {searchQuery || selectedPriority !== 'all' || activeFilter !== 'all'
                  ? "No tasks match your current filters"
                  : "You don't have any assigned tasks yet"}
              </Text>
              <Pressable 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedPriority('all');
                  setActiveFilter('all');
                }} 
                className="bg-blue-600 py-2 px-5 rounded-lg"
              >
                <Text className="text-white font-geist-semibold">
                  {searchQuery || selectedPriority !== 'all' || activeFilter !== 'all'
                    ? "Clear Filters"
                    : "Refresh"
                  }
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
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
        <Pressable onPress={() => navigation.navigate('techniciandashboard')} className="items-center px-3">
          <HomeIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Dashboard</Text>
        </Pressable>
        <Pressable className="items-center px-3">
          <InboxIcon size={22} color="#3B82F6" />
          <Text className="text-xs mt-1 text-blue-600 font-geist-semibold">Tasks</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('technicianclockin')} className="items-center px-3">
          <ClockIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Clock-in</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('technicianprofile')} className="items-center px-3">
          <UserIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TechnicianTasks;