// PersonalInfo.js
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ClockIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    HomeIcon,
    IdentificationIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const PersonalInfo = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      // Simulate API call to get user data
      setTimeout(() => {
        setUserData({
          ...user,
          phone: user.phone || '+1 (555) 123-4567',
          dateOfBirth: user.dateOfBirth || 'January 15, 1985',
          emergencyContact: user.emergencyContact || 'Sarah Johnson',
          emergencyPhone: user.emergencyPhone || '+1 (555) 987-6543',
          preferredLanguage: user.preferredLanguage || 'English',
          occupation: user.occupation || 'Building Manager',
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
        setLoading(false);
      }, 800);
    }
  }, [user]);

  const InfoItem = ({ icon, label, value, color = "#EC3237" }) => (
    <View className="flex-row items-center py-3.5 border-b border-gray-100">
      <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
        {icon}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-gray-500 text-xs font-geist mb-0.5">{label}</Text>
        <Text className="text-gray-800 font-geist-semibold">{value}</Text>
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
        className="pt-12 pb-6"
      >
        <View className="px-5 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-full"
          >
            <ChevronLeftIcon size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-geist-semibold">Personal Information</Text>
          <TouchableOpacity 
            className="bg-white/20 p-2 rounded-full"
            onPress={() => navigation.navigate('editprofile', { userData })}
          >
            <UserIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 20,
        }}
      >
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#EC3237" />
          </View>
        ) : (
          <>
            {/* Basic Information Card */}
            <View className="mx-5 mb-6">
              <Text className="text-gray-500 font-geist-semibold text-sm mb-2">BASIC INFORMATION</Text>
              <View
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <InfoItem
                  icon={<UserIcon size={20} color="#EC3237" />}
                  label="Full Name"
                  value={`${userData?.firstName || 'John'} ${userData?.lastName || 'Doe'}`}
                />

                <InfoItem
                  icon={<EnvelopeIcon size={20} color="#3B82F6" />}
                  label="Email Address"
                  value={userData?.email || 'john.doe@example.com'}
                  color="#3B82F6"
                />

                <InfoItem
                  icon={<PhoneIcon size={20} color="#10B981" />}
                  label="Phone Number"
                  value={userData?.phone}
                  color="#10B981"
                />

                <InfoItem
                  icon={<MapPinIcon size={20} color="#F59E0B" />}
                  label="Address"
                  value={userData?.address || '123 Main Street, City'}
                  color="#F59E0B"
                />
              </View>
            </View>

            {/* Additional Information Card */}
            <View className="mx-5 mb-6">
              <Text className="text-gray-500 font-geist-semibold text-sm mb-2">ADDITIONAL DETAILS</Text>
              <View
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <InfoItem
                  icon={<IdentificationIcon size={20} color="#EC3237" />}
                  label="Occupation"
                  value={userData?.occupation}
                />

                <InfoItem
                  icon={<PhoneIcon size={20} color="#F59E0B" />}
                  label="Emergency Contact"
                  value={userData?.emergencyContact}
                  color="#F59E0B"
                />

                <InfoItem
                  icon={<EnvelopeIcon size={20} color="#3B82F6" />}
                  label="Emergency Phone"
                  value={userData?.emergencyPhone}
                  color="#3B82F6"
                />

                <InfoItem
                  icon={<ClockIcon size={20} color="#8B5CF6" />}
                  label="Member Since"
                  value={userData?.joinDate}
                  color="#8B5CF6"
                />
              </View>
            </View>

            {/* Edit Profile Button */}
            <View className="mx-5 mt-4">
              <TouchableOpacity
                onPress={() => navigation.navigate('editprofile', { userData })}
                className="bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white font-geist-semibold text-base">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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

export default PersonalInfo;

// EditProfile.js
