import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ArrowRightIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const UserProfile = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [elevatorData, setElevatorData] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData({
        ...user,
        joinDate: new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
      
      // Simulate fetching elevator details (would connect to your API)
      fetchElevatorDetails();
    }
  }, [user]);

  const fetchElevatorDetails = async () => {
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setElevatorData({
        elevatorId: user?.elevator || 'EL-1234',
        model: 'StratoLift Premium',
        installDate: '2023-06-15',
        lastInspection: '2025-03-22',
        nextInspection: '2025-09-22',
        capacity: '1000 kg',
        floors: '12',
      });
      setLoading(false);
    }, 800);
    
    // In production, you would fetch real data like this:
    /*
    try {
      const response = await fetch(`https://stratoliftapp.vercel.app/api/elevators/${user.elevator}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch elevator details');
      }

      setElevatorData(data);
    } catch (err) {
      console.error('Error fetching elevator details:', err);
    } finally {
      setLoading(false);
    }
    */
  };

  const InfoItem = ({ icon, label, value, color = "#EC3237" }) => (
    <View className="flex-row items-center py-3.5 border-b border-gray-100">
      <View className={`w-10 h-10 rounded-full items-center justify-center bg-${color.replace('#', '')}/10`} style={{ backgroundColor: `${color}10` }}>
        {icon}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-gray-500 text-xs font-geist mb-0.5">{label}</Text>
        <Text className="text-gray-800 font-geist-semibold">{value}</Text>
      </View>
    </View>
  );

  const MenuSection = ({ title, items }) => (
    <View className="mb-6">
      <Text className="text-gray-500 font-geist-semibold text-sm mb-2 px-5">{title}</Text>
      <View className="bg-white rounded-2xl px-5 shadow-sm" 
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            className={`flex-row items-center justify-between py-3.5 ${
              index < items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${item.color}15` }}
              >
                {item.icon}
              </View>
              <Text className="ml-3 font-geist-semibold text-gray-800">{item.label}</Text>
            </View>
            <ArrowRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header with gradient */}
      <LinearGradient
        colors={['#EC3237', '#F43F5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 rounded-b-3xl"
      >
        <View className="px-5 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-full"
          >
            <ChevronLeftIcon size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-geist-semibold">My Profile</Text>
          <TouchableOpacity onPress={()=> navigation.navigate('editprofile')} className="bg-white/20 p-2 rounded-full">
            <PencilIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Summary */}
        <View className="items-center mt-6">
          <View className="relative">
            <Image
              source={require('../assets/profile.png')}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              defaultSource={require('../assets/profile.png')}
            />
            <View className="absolute bottom-0 right-0 bg-white p-1 rounded-full">
              <CheckBadgeIcon size={20} color="#10B981" />
            </View>
          </View>
          
          <Text className="text-white text-xl font-geist-bold mt-3">
            {userData?.firstName} {userData?.lastName}
          </Text>
          <View className="flex-row items-center mt-1">
            <BuildingOfficeIcon size={16} color="#fff" opacity={0.8} />
            <Text className="text-white/90 font-geist ml-1">
              Elevator {userData?.elevator || 'User'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        className="flex-1 -mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* User Info Card */}
        <View className="mx-5 bg-white rounded-2xl p-5 shadow-md mb-6" 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <InfoItem
            icon={<EnvelopeIcon size={20} color="#EC3237" />}
            label="Email Address"
            value={userData?.email || 'user@example.com'}
          />
          
          <InfoItem
            icon={<MapPinIcon size={20} color="#3B82F6" />}
            label="Address"
            value={userData?.address || '123 Main Street, City'}
            color="#3B82F6"
          />
          
          <InfoItem
            icon={<ClockIcon size={20} color="#8B5CF6" />}
            label="Member Since"
            value={userData?.joinDate || 'January 2023'}
            color="#8B5CF6"
          />
          
          <InfoItem
            icon={<ShieldCheckIcon size={20} color="#10B981" />}
            label="Account Status"
            value={userData?.status || 'Active'}
            color="#10B981"
          />
        </View>

        {/* Elevator Details Card */}
        <View className="mx-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-geist-bold text-gray-800">Elevator Details</Text>
            {loading && <ActivityIndicator size="small" color="#EC3237" />}
          </View>
          
          {elevatorData ? (
            <View className="bg-white rounded-2xl overflow-hidden shadow-md" 
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['#f8f9fa', '#ffffff']}
                className="px-5 py-4 border-b border-gray-100"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="bg-blue-50 p-2.5 rounded-xl mr-3">
                      <BuildingOfficeIcon size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <Text className="text-gray-800 font-geist-semibold text-lg">
                        {elevatorData.elevatorId}
                      </Text>
                      <Text className="text-gray-500 text-xs font-geist">
                        {elevatorData.model}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-green-100 py-1 px-3 rounded-full">
                    <Text className="text-green-600 text-xs font-geist-semibold">
                      Active
                    </Text>
                  </View>
                </View>
              </LinearGradient>
              
              <View className="p-5">
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-xs font-geist mb-1">Installed On</Text>
                    <Text className="text-gray-800 font-geist-semibold">
                      {new Date(elevatorData.installDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-500 text-xs font-geist mb-1">Last Inspection</Text>
                    <Text className="text-gray-800 font-geist-semibold">
                      {new Date(elevatorData.lastInspection).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-xs font-geist mb-1">Capacity</Text>
                    <Text className="text-gray-800 font-geist-semibold">{elevatorData.capacity}</Text>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-500 text-xs font-geist mb-1">Floors Serviced</Text>
                    <Text className="text-gray-800 font-geist-semibold">{elevatorData.floors}</Text>
                  </View>
                </View>

                <View className="bg-blue-50 rounded-xl p-4 flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-lg mr-3">
                    <CalendarIcon size={18} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-800 font-geist-semibold text-sm">Next Inspection</Text>
                    <Text className="text-blue-600 text-xs font-geist">
                      {new Date(elevatorData.nextInspection).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : !loading ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center shadow-sm">
              <Image
                source={require('../assets/no-activity.png')}
                style={{ width: width * 0.2, height: width * 0.2, opacity: 0.8, marginBottom: 12 }}
              />
              <Text className="text-gray-700 font-geist-semibold mb-1">No Elevator Data</Text>
              <Text className="text-gray-500 text-center mb-4 font-geist text-sm">
                Elevator information is not available
              </Text>
              <TouchableOpacity 
                onPress={fetchElevatorDetails}
                className="bg-primary py-2 px-5 rounded-lg"
              >
                <Text className="text-white font-geist-semibold">Refresh Data</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Settings and Options */}
        <MenuSection
          title="ACCOUNT SETTINGS"
          items={[
            {
              icon: <UserIcon size={20} color="#EC3237" />,
              label: "Personal Information",
              color: "#EC3237",
              onPress: () => navigation.navigate('personalinfo'),
            },
            {
              icon: <DocumentTextIcon size={20} color="#8B5CF6" />,
              label: "Service History",
              color: "#8B5CF6",
              onPress: () => navigation.navigate('history'),
            },
          ]}
        />
      </ScrollView>
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
          <ClockIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">History</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('profile')} className="items-center px-3">
          <UserIcon size={22} color="#EC3237" />
          <Text className="text-xs mt-1 text-primary font-geist-semibold">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

// Simple Calendar Icon component
const CalendarIcon = ({ size, color }) => (
  <View>
    <View style={{ width: size, height: size/3, backgroundColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
    <View style={{ width: size, height: size*2/3, backgroundColor: 'white', borderWidth: 1.5, borderColor: color, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />
  </View>
);

export default UserProfile;