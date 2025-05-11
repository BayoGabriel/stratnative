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
  View,
  RefreshControl
} from 'react-native';
import {
  ArrowRightIcon,
  BellIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InboxIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const TechnicianDashboard = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [statsData, setStatsData] = useState({
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0
  });

  // Animation values
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const cardOpacity = useState(new Animated.Value(0))[0];

  // Reference for filter button
  const filterButtonRef = useRef(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    fetchTechnicianTasks();
  }, [user, token]);

  useEffect(() => {
    if (tasks.length > 0) {
      filterTasks(activeFilter);
      calculateStats();
    }
  }, [tasks, activeFilter]);

  const calculateStats = () => {
    const pendingCount = tasks.filter(task => task.status === 'pending' || task.status === 'assigned').length;
    const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
    const completedCount = tasks.filter(task => task.status === 'completed' || task.status === 'resolved').length;
    
    setStatsData({
      pendingCount,
      inProgressCount,
      completedCount
    });
  };

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

  const filterTasks = (filter) => {
    setActiveFilter(filter);
    
    switch (filter) {
      case 'pending':
        setFilteredTasks(tasks.filter(task => task.status === 'pending' || task.status === 'assigned'));
        break;
      case 'in-progress':
        setFilteredTasks(tasks.filter(task => task.status === 'in-progress'));
        break;
      case 'completed':
        setFilteredTasks(tasks.filter(task => task.status === 'completed' || task.status === 'resolved'));
        break;
      default:
        setFilteredTasks(tasks);
        break;
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

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <View 
      className={`${bgColor} p-4 rounded-2xl flex-1 shadow-sm`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        minWidth: (width - 60) / 3,
      }}
    >
      <View className="flex-row items-center mb-2">
        <View className={`${color} p-2 rounded-lg mr-2`}>
          {icon}
        </View>
      </View>
      <Text className="font-geist-bold text-2xl text-gray-800">{value}</Text>
      <Text className="font-geist text-gray-500 text-xs mt-1">{title}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header Section */}
      <LinearGradient
        colors={['#ffffff', '#fafafa']}
        className="pt-2 pb-4"
      >
        <View className="flex-row justify-between items-center px-5 pb-1">
          <View className="flex-row items-center">
            <Image
              source={require('../assets/profile.png')}
              style={{ width: 42, height: 42, borderRadius: 21, marginRight: 12 }}
              defaultSource={require('../assets/profile.png')}
            />
            <View>
              <Text className="text-sm font-geist text-gray-500">Welcome,</Text>
              <Text className="text-lg font-geist-bold text-gray-800">{user?.firstName || 'Technician'}</Text>
            </View>
          </View>
          <Pressable 
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <BellIcon size={20} color="#374151" />
          </Pressable>
        </View>
      </LinearGradient>

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
        {/* Summary Card */}
        <Animated.View 
          style={{ 
            transform: [{ scale: scaleAnim }],
            opacity: cardOpacity,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 20
          }}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 rounded-2xl shadow-lg"
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="bg-white/20 rounded-full p-3">
                <WrenchScrewdriverIcon size={24} color="#fff" />
              </View>
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 font-geist-semibold text-xs">
                  {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </Text>
              </View>
            </View>
            <Text className="text-white font-geist-bold text-xl mb-1">Task Dashboard</Text>
            <Text className="text-white/80 font-geist text-sm mb-4">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} assigned to you
            </Text>
            
            <Pressable 
              onPress={() => navigation.navigate('newTask')}
              className="bg-white/20 self-start rounded-lg px-4 py-2 flex-row items-center mt-1"
            >
              <Text className="text-white font-geist-semibold mr-2">View Schedule</Text>
              <ArrowRightIcon size={16} color="#fff" />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* Stats Cards */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-geist-bold text-gray-800 mb-4">Task Summary</Text>
          <View className="flex-row gap-2 justify-between">
            <StatCard 
              title="Pending"
              value={statsData.pendingCount}
              icon={<ClockIcon size={18} color="#F59E0B" />}
              color="bg-amber-100"
              bgColor="bg-white"
            />
            <StatCard 
              title="In Progress"
              value={statsData.inProgressCount}
              icon={<WrenchScrewdriverIcon size={18} color="#3B82F6" />}
              color="bg-blue-100"
              bgColor="bg-white"
            />
            <StatCard 
              title="Completed"
              value={statsData.completedCount}
              icon={<CheckCircleIcon size={18} color="#10B981" />}
              color="bg-green-100"
              bgColor="bg-white"
            />
          </View>
        </View>

        {/* Tasks Section */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-geist-bold text-gray-800">Assigned Tasks</Text>
            <View className="relative">
              <Pressable 
                ref={filterButtonRef}
                onPress={() => setFilterMenuVisible(!filterMenuVisible)}
                className="bg-white py-1.5 px-3 rounded-lg flex-row items-center shadow-sm"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text className="text-gray-700 text-sm font-geist-semibold mr-1">
                  {activeFilter === 'all' ? 'All Tasks' : 
                   activeFilter === 'pending' ? 'Pending' : 
                   activeFilter === 'in-progress' ? 'In Progress' : 'Completed'}
                </Text>
                <ChevronDownIcon size={16} color="#6B7280" />
              </Pressable>
              
              {filterMenuVisible && (
                <View 
                  className="absolute top-10 right-0 bg-white rounded-lg shadow-md z-50 w-36"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Pressable 
                    onPress={() => {
                      filterTasks('all');
                      setFilterMenuVisible(false);
                    }}
                    className="px-4 py-2.5 border-b border-gray-100"
                  >
                    <Text className="text-gray-700 font-geist">All Tasks</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      filterTasks('pending');
                      setFilterMenuVisible(false);
                    }}
                    className="px-4 py-2.5 border-b border-gray-100"
                  >
                    <Text className="text-gray-700 font-geist">Pending</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      filterTasks('in-progress');
                      setFilterMenuVisible(false);
                    }}
                    className="px-4 py-2.5 border-b border-gray-100"
                  >
                    <Text className="text-gray-700 font-geist">In Progress</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      filterTasks('completed');
                      setFilterMenuVisible(false);
                    }}
                    className="px-4 py-2.5"
                  >
                    <Text className="text-gray-700 font-geist">Completed</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

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
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-white font-geist-semibold">Try Again</Text>
              </Pressable>
            </View>
          ) : filteredTasks.length > 0 ? (
            <Animated.View 
              style={{ opacity: cardOpacity }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              {filteredTasks.map((task, index) => (
                <Pressable 
                  key={task._id || index} 
                  onPress={() => navigateToTaskDetail(task._id)}
                  className={`p-4 ${index !== filteredTasks.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row flex-1 mr-2">
                      <View className="bg-gray-50 p-2.5 rounded-xl mr-3">
                        {getIconForTaskType(task.type)}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-geist-semibold text-gray-800">
                            {task.title}
                          </Text>
                        </View>
                        <Text numberOfLines={2} className="text-gray-500 text-xs font-geist mb-2">
                          {task.description}
                        </Text>
                        <View className="flex-row items-center mb-1">
                          <Text className="text-gray-500 text-xs font-geist mr-2">
                            ID: {task.taskId || '#12345'}
                          </Text>
                          <Text className="text-gray-500 text-xs font-geist">
                            {formatTimeAgo(task.createdAt)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row">
                            <View className={`py-1 px-2.5 rounded-full ${getStatusColor(task.status).split(' ')[0]} mr-2`}>
                              <Text className={`text-xs font-geist ${getStatusColor(task.status).split(' ')[1]}`}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </Text>
                            </View>
                            {task.priority && (
                              <View className={`py-1 px-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}>
                                <Text className={`text-[10px] font-geist ${getPriorityColor(task.priority).split(' ')[1]}`}>
                                  {task.priority.toUpperCase()}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Pressable 
                            onPress={() => navigateToTaskDetail(task._id)}
                            className="bg-gray-100 rounded-full p-1.5"
                          >
                            <ArrowRightIcon size={14} color="#4B5563" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </Animated.View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm">
              <Image
                source={require('../assets/no-activity.png')}
                style={{ width: width * 0.25, height: width * 0.25, opacity: 0.8, marginBottom: 16 }}
              />
              <Text className="text-gray-700 font-geist-semibold mb-1">No tasks found</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist">
                {activeFilter === 'all' 
                  ? "You don't have any assigned tasks yet" 
                  : `No ${activeFilter} tasks found`}
              </Text>
              <Pressable 
                onPress={() => setActiveFilter('all')} 
                className="bg-blue-600 py-2 px-5 rounded-lg"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {activeFilter === 'all' ? (
                  <Text className="text-white font-geist-semibold">Refresh</Text>
                ) : (
                  <Text className="text-white font-geist-semibold">View All Tasks</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
        
        {/* Recent Activity Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-geist-bold text-gray-800 mb-4">My Statistics</Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center">
                <View className="bg-blue-50 p-3 rounded-xl mr-3">
                  <ShieldCheckIcon size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="font-geist-semibold text-gray-800">Performance</Text>
                  <Text className="text-gray-500 text-xs font-geist">This week</Text>
                </View>
              </View>
            </View>
            
            {/* Progress bars */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-gray-600 text-xs font-geist">Tasks Completed</Text>
                <Text className="text-gray-700 text-xs font-geist-semibold">
                  {statsData.completedCount}/{tasks.length}
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ 
                    width: `${tasks.length > 0 ? (statsData.completedCount / tasks.length) * 100 : 0}%` 
                  }} 
                />
              </View>
            </View>
            
            <View className="mb-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-gray-600 text-xs font-geist">Response Time</Text>
                <Text className="text-gray-700 text-xs font-geist-semibold">85%</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
              </View>
            </View>
            
            <View>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-gray-600 text-xs font-geist">Customer Satisfaction</Text>
                <Text className="text-gray-700 text-xs font-geist-semibold">92%</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-amber-500 rounded-full" style={{ width: "92%" }} />
              </View>
            </View>
          </View>
        </View>
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
        <Pressable className="items-center px-3">
          <HomeIcon size={22} color="#3B82F6" />
          <Text className="text-xs mt-1 text-blue-600 font-geist-semibold">Dashboard</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('tasks')} className="items-center px-3">
          <InboxIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Tasks</Text>
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

export default TechnicianDashboard;