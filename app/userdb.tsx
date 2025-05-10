import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import {
  ArrowRightIcon,
  BellIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InboxIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const UserDashboard = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation value for card scale effect
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchUserTasks();
  }, [user, token]);

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
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getIconForTaskType = (type) => {
    const iconSize = Platform.OS === 'android' ? 22 : 20;
    
    switch (type) {
      case 'service':
        return <UserCircleIcon size={iconSize} color="#6366F1" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon size={iconSize} color="#3B82F6" />;
      case 'sos':
        return <Image
        source={require('../assets/stuck.png')}
      />;
      case 'issue':
        return <ExclamationTriangleIcon size={iconSize} color="#F59E0B" />;
      case 'stuck':
        return <Image
        source={require('../assets/emergency.png')}
      />;
      default:
        return <InboxIcon size={iconSize} color="#6B7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'in-progress':
      case 'assigned':
        return 'bg-blue-100 text-blue-600';
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

  const navigateToTaskDetail = (taskId) => {
    navigation.navigate('taskdetail', { taskId });
  };

  const ServiceCard = ({ icon, title, onPress, color }) => (
    <Pressable 
      onPress={onPress} 
      className={`items-center bg-white p-4 rounded-2xl flex-1 shadow-sm`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className={`${color} w-14 h-14 rounded-full items-center justify-center mb-2`}>
        {icon}
      </View>
      <Text className="text-[13px] font-geist-semibold text-center">{title}</Text>
    </Pressable>
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
              <Text className="text-sm font-geist text-gray-500">Welcome back,</Text>
              <Text className="text-lg font-geist-bold text-gray-800">{user?.firstName || 'User'}</Text>
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
      >
        {/* Emergency Card */}
        <Animated.View 
          style={{ 
            transform: [{ scale: scaleAnim }],
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 24
          }}
        >
          <Pressable 
            onPress={() => navigation.navigate('useremergency')} 
            className="overflow-hidden rounded-2xl"
            style={{
              shadowColor: '#EC3237',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <LinearGradient
              colors={['#EC3237', '#F43F5E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-2xl"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="bg-white/20 rounded-full p-3 mr-4">
                  <Image
                    source={require('../assets/emergency.png')}
                  />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-geist-bold text-xl mb-1">Emergency Help</Text>
                    <Text className="text-white/90 font-geist text-sm">
                      Report critical issues for immediate assistance
                    </Text>
                  </View>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <ArrowRightIcon size={20} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Service Request Cards */}
        <View className="px-5 mb-8">
          <Text className="text-lg font-geist-bold text-gray-800 mb-4">Service Requests</Text>
          <View className="flex-row justify-between gap-2">
            <ServiceCard 
              icon={<UserCircleIcon size={24} color="#EC3237" />}
              title="Request Visit"
              color="bg-red-50"
              onPress={() => navigation.navigate('userreport')}
            />
            <ServiceCard 
              icon={<WrenchScrewdriverIcon size={24} color="#3B82F6" />}
              title="Maintenance"
              color="bg-blue-50"
              onPress={() => navigation.navigate('usermaintenance')}
            />
            <ServiceCard 
              icon={<ExclamationTriangleIcon size={24} color="#F59E0B" />}
              title="Report Issue"
              color="bg-amber-50"
              onPress={() => navigation.navigate('userreport')}
            />
          </View>
        </View>

        {/* Recent Updates */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-geist-bold text-gray-800">Recent Updates</Text>
            <Pressable 
              onPress={() => navigation.navigate('history')}
              className="bg-gray-100 py-1 px-3 rounded-full"
            > 
              <Text className="text-gray-600 text-xs font-geist">View all</Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm">
              <ActivityIndicator size="large" color="#EC3237" />
              <Text className="text-gray-500 mt-3 font-geist">Loading updates...</Text>
            </View>
          ) : error ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm">
              <View className="bg-red-50 p-3 rounded-full mb-2">
                <ExclamationTriangleIcon size={24} color="#EC3237" />
              </View>
              <Text className="text-gray-700 font-geist-bold mb-1">Unable to load tasks</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist">There was a problem connecting to the service</Text>
              <Pressable 
                onPress={fetchUserTasks} 
                className="bg-primary py-2 px-5 rounded-lg"
                style={{
                  shadowColor: '#EC3237',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-white font-geist-semibold">Try Again</Text>
              </Pressable>
            </View>
          ) : tasks.length > 0 ? (
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {tasks.map((task, index) => (
                <Pressable 
                  key={task._id} 
                  onPress={() => navigateToTaskDetail(task._id)}
                  className={`p-4 ${index !== tasks.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className="bg-gray-50 p-2.5 rounded-xl mr-3">
                      {getIconForTaskType(task.type)}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-geist-semibold text-gray-800">{task.title}</Text>
                        <View className={`py-1 px-2.5 rounded-full ${getStatusColor(task.status).split(' ')[0]}`}>
                          <Text className={`text-xs font-geist ${getStatusColor(task.status).split(' ')[1]}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-xs font-geist">
                          {formatTimeAgo(task.createdAt)}
                        </Text>
                        {task.priority && (
                          <View className={`py-0.5 px-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}>
                            <Text className={`text-[10px] font-geist ${getPriorityColor(task.priority).split(' ')[1]}`}>
                              {task.priority.toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Image
                source={require('../assets/no-activity.png')}
                style={{ width: width * 0.25, height: width * 0.25, opacity: 0.8, marginBottom: 16 }}
              />
              <Text className="text-gray-700 font-geist-semibold mb-1">No active tasks</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist">You don't have any service requests yet</Text>
              <Pressable 
                onPress={() => navigation.navigate('userreport')}
                className="bg-primary py-2 px-5 rounded-lg"
                style={{
                  shadowColor: '#EC3237',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-white font-geist-semibold">Create a Request</Text>
              </Pressable>
            </View>
          )}
        </View>
        
        {/* Building Status Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-geist-bold text-gray-800 mb-4">Elevator Status</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="bg-green-50 p-2.5 rounded-xl mr-3">
                  <ShieldCheckIcon size={20} color="#10B981" />
                </View>
                <View>
                  <Text className="font-geist-semibold text-gray-800">Elevator {user?.elevator || 'System'}</Text>
                  <Text className="text-gray-500 text-xs font-geist">All systems operational</Text>
                </View>
              </View>
              <View className="bg-green-100 py-1 px-3 rounded-full">
                <Text className="text-green-600 text-xs font-geist">Active</Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-3">
              <Text className="text-xs text-gray-500 font-geist">
                Last maintenance: <Text className="text-gray-700 font-geist-semibold">
                  {tasks.filter(task => task.status === 'completed' || task.status === 'resolved').length > 0 
                    ? new Date(Math.max(...tasks
                        .filter(task => task.status === 'completed' || task.status === 'resolved')
                        .map(task => task.completedAt ? new Date(task.completedAt) : new Date(task.updatedAt))
                      )).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
                    : 'No recent maintenance'}
                </Text>
              </Text>
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
          <HomeIcon size={22} color="#EC3237" />
          <Text className="text-xs mt-1 text-primary font-geist-semibold">Home</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('blog')} className="items-center px-3">
          <DocumentTextIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Blog</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('history')} className="items-center px-3">
          <ClockIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">History</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('profile')} className="items-center px-3">
          <UserIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default UserDashboard;