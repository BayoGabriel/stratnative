import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  RefreshControl,
  Platform
} from 'react-native';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  InboxIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

const TechnicianProfile = () => {
  const { user, token, logout } = useUser();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statsData, setStatsData] = useState({
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    totalTasks: 0,
    responseTime: '24 min',
    avgCompletion: '1.5 days',
    customerRating: 4.8,
    taskCompletionRate: 94
  });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    fetchTechnicianTasks();
  }, [user, token]);

  useEffect(() => {
    if (tasks.length > 0) {
      calculateStats();
    }
  }, [tasks]);

  const calculateStats = () => {
    const pendingCount = tasks.filter(task => task.status === 'pending' || task.status === 'assigned').length;
    const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
    const completedCount = tasks.filter(task => task.status === 'completed' || task.status === 'resolved').length;
    const totalTasks = tasks.length;
    
    setStatsData({
      pendingCount,
      inProgressCount,
      completedCount,
      totalTasks,
      responseTime: '24 min',
      avgCompletion: '1.5 days',
      customerRating: 4.8,
      taskCompletionRate: completedCount > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
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
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} size={16} color="#F59E0B" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} size={16} color="#F59E0B" style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<StarIcon key={i} size={16} color="#E5E7EB" />);
      }
    }
    
    return stars;
  };

  const StatBlock = ({ title, value, icon, color }) => (
    <View className="items-center bg-white rounded-2xl py-5 px-3 shadow-sm flex-1 mx-1">
      <View className={`${color} p-2 rounded-full mb-2`}>
        {icon}
      </View>
      <Text className="font-geist-bold text-xl text-gray-800">{value}</Text>
      <Text className="font-geist-medium text-xs text-gray-500 text-center mt-1">{title}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header Section */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6"
      >
        <View className="flex-row justify-between items-center px-5">
          <Pressable 
            onPress={() => navigation.goBack()} 
            className="bg-white/20 p-2 rounded-full"
          >
            <ArrowLeftIcon size={20} color="#fff" />
          </Pressable>
          <Text className="text-white font-geist-semibold text-lg">My Profile</Text>
          <Pressable className="bg-white/20 p-2 rounded-full">
            <CogIcon size={20} color="#fff" />
          </Pressable>
        </View>
        
        <View className="items-center mt-4">
          <View className="bg-white p-1 rounded-full shadow-md">
            <Image
              source={require('../assets/profile.png')}
              style={{ 
                width: 100, 
                height: 100, 
                borderRadius: 50,
              }}
              defaultSource={require('../assets/profile.png')}
            />
          </View>
          <Text className="text-white font-geist-bold text-xl mt-3">
            {user?.firstName} {user?.lastName}
          </Text>
          <View className="bg-white/20 px-3 py-1 rounded-full mt-2">
            <Text className="text-white font-geist">Senior Technician</Text>
          </View>
          
          <View className="flex-row mt-4">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-1.5 rounded-full mr-2">
                <CheckBadgeIcon size={14} color="#fff" />
              </View>
              <Text className="text-white font-geist-medium text-sm">
                {statsData.taskCompletionRate}% Completion
              </Text>
            </View>
            <View className="h-4 mx-3 w-px bg-white/30 self-center" />
            <View className="flex-row items-center">
              <View className="bg-white/20 p-1.5 rounded-full mr-2">
                <StarIcon size={14} color="#fff" />
              </View>
              <Text className="text-white font-geist-medium text-sm">
                {statsData.customerRating} Rating
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1 pt-4"
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
        {/* Contact Information */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="mx-5 mb-6">
            <Text className="text-lg font-geist-bold text-gray-800 mb-3">Contact Information</Text>
            <View 
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-50 p-2 rounded-lg mr-3">
                  <EnvelopeIcon size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-xs font-geist text-gray-500">Email Address</Text>
                  <Text className="font-geist-medium text-gray-800">{user?.email}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-4">
                <View className="bg-green-50 p-2 rounded-lg mr-3">
                  <PhoneIcon size={20} color="#10B981" />
                </View>
                <View>
                  <Text className="text-xs font-geist text-gray-500">Phone Number</Text>
                  <Text className="font-geist-medium text-gray-800">{user?.phone}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="bg-amber-50 p-2 rounded-lg mr-3">
                  <MapPinIcon size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-xs font-geist text-gray-500">Address</Text>
                  <Text className="font-geist-medium text-gray-800">{user?.address}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Task Statistics */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            delay: 100
          }}
        >
          <View className="mx-5 mb-6">
            <Text className="text-lg font-geist-bold text-gray-800 mb-3">Task Statistics</Text>
            <View className="flex-row justify-between mb-3">
              <StatBlock 
                title="Total Tasks"
                value={statsData.totalTasks}
                icon={<DocumentTextIcon size={20} color="#3B82F6" />}
                color="bg-blue-100"
              />
              <StatBlock 
                title="In Progress"
                value={statsData.inProgressCount}
                icon={<WrenchScrewdriverIcon size={20} color="#F59E0B" />}
                color="bg-amber-100"
              />
              <StatBlock 
                title="Completed"
                value={statsData.completedCount}
                icon={<CheckBadgeIcon size={20} color="#10B981" />}
                color="bg-green-100"
              />
            </View>
          </View>
        </Animated.View>
        
        {/* Performance Metrics */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            delay: 200
          }}
        >
          <View className="mx-5 mb-6">
            <Text className="text-lg font-geist-bold text-gray-800 mb-3">Performance Metrics</Text>
            <View 
              className="bg-white rounded-2xl p-5 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              {/* Task Completion Rate */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="bg-green-50 p-1.5 rounded-lg mr-2">
                      <ChartBarIcon size={18} color="#10B981" />
                    </View>
                    <Text className="font-geist-medium text-gray-800">Task Completion Rate</Text>
                  </View>
                  <Text className="font-geist-bold text-gray-800">{statsData.taskCompletionRate}%</Text>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${statsData.taskCompletionRate}%` }} 
                  />
                </View>
              </View>
              
              {/* Average Response Time */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                      <ClockIcon size={18} color="#3B82F6" />
                    </View>
                    <Text className="font-geist-medium text-gray-800">Avg. Response Time</Text>
                  </View>
                  <Text className="font-geist-bold text-gray-800">{statsData.responseTime}</Text>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }} />
                </View>
              </View>
              
              {/* Average Completion Time */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="bg-purple-50 p-1.5 rounded-lg mr-2">
                      <CalendarDaysIcon size={18} color="#8B5CF6" />
                    </View>
                    <Text className="font-geist-medium text-gray-800">Avg. Completion Time</Text>
                  </View>
                  <Text className="font-geist-bold text-gray-800">{statsData.avgCompletion}</Text>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-purple-500 rounded-full" style={{ width: "75%" }} />
                </View>
              </View>
              
              {/* Customer Satisfaction */}
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="bg-amber-50 p-1.5 rounded-lg mr-2">
                      <StarIcon size={18} color="#F59E0B" />
                    </View>
                    <Text className="font-geist-medium text-gray-800">Customer Satisfaction</Text>
                  </View>
                  <View className="flex-row">
                    {renderStars(statsData.customerRating)}
                  </View>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(statsData.customerRating / 5) * 100}%` }} 
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            delay: 300
          }}
        >
          <View className="mx-5 mb-8">
            <Text className="text-lg font-geist-bold text-gray-800 mb-3">Quick Actions</Text>
            <View 
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <Pressable 
                className="flex-row justify-between items-center p-4 border-b border-gray-100"
                onPress={() => navigation.navigate('technicianclockin')}
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-50 p-2.5 rounded-lg mr-3">
                    <ClockIcon size={20} color="#3B82F6" />
                  </View>
                  <Text className="font-geist-medium text-gray-800">Clock In/Out</Text>
                </View>
                <ArrowRightIcon size={18} color="#9CA3AF" />
              </Pressable>
              
              <Pressable 
                className="flex-row justify-between items-center p-4 border-b border-gray-100"
                onPress={() => navigation.navigate('tasks')}
              >
                <View className="flex-row items-center">
                  <View className="bg-indigo-50 p-2.5 rounded-lg mr-3">
                    <InboxIcon size={20} color="#6366F1" />
                  </View>
                  <Text className="font-geist-medium text-gray-800">View All Tasks</Text>
                </View>
                <ArrowRightIcon size={18} color="#9CA3AF" />
              </Pressable>
              
              {/* <Pressable 
                className="flex-row justify-between items-center p-4"
                onPress={handleLogout}
              >
                <View className="flex-row items-center">
                  <View className="bg-red-50 p-2.5 rounded-lg mr-3">
                    <ArrowLeftIcon size={20} color="#EF4444" />
                  </View>
                  <Text className="font-geist-medium text-gray-800">Logout</Text>
                </View>
                <ArrowRightIcon size={18} color="#9CA3AF" />
              </Pressable> */}
            </View>
          </View>
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
        <Pressable 
          onPress={() => navigation.navigate('techniciandb')} 
          className="items-center px-3"
        >
          <HomeIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Dashboard</Text>
        </Pressable>
        <Pressable 
          onPress={() => navigation.navigate('techniciantasks')} 
          className="items-center px-3"
        >
          <InboxIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Tasks</Text>
        </Pressable>
        <Pressable 
          onPress={() => navigation.navigate('technicianclockin')} 
          className="items-center px-3"
        >
          <ClockIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Clock-in</Text>
        </Pressable>
        <Pressable 
          className="items-center px-3"
        >
          <UserIcon size={22} color="#3B82F6" />
          <Text className="text-xs mt-1 text-blue-600 font-geist-semibold">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TechnicianProfile;