import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Platform,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  HomeIcon,
  InboxIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  UserIcon,
  CheckCircleIcon
} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const TechnicianClockIn = () => {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [addressString, setAddressString] = useState('Fetching location...');
  const [notes, setNotes] = useState('');
  const [activeClockIn, setActiveClockIn] = useState(null);
  const [recentClockIns, setRecentClockIns] = useState([]);
  const [locationError, setLocationError] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Run animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize data
    fetchLocation();
    fetchClockInData();
  }, []);

  const fetchLocation = async () => {
    try {
      setLocationError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setAddressString('Location access denied');
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Reverse geocode to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        const addressParts = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean);
        
        setAddressString(addressParts.join(', '));
      } else {
        setAddressString('Unknown location');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocationError(`Error getting location: ${error.message}`);
      setAddressString('Unable to fetch location');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchClockInData = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Get all clock-ins with status=active to check if already clocked in
      const activeResponse = await fetch('https://stratoliftapp.vercel.app/api/clock-in?status=active', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!activeResponse.ok) {
        throw new Error('Failed to fetch active clock-in data');
      }

      const activeData = await activeResponse.json();
      
      if (activeData.success && activeData.data && activeData.data.length > 0) {
        setActiveClockIn(activeData.data[0]);
      } else {
        setActiveClockIn(null);
      }

      // Get recent clock-ins (limit to 5)
      const recentResponse = await fetch('https://stratoliftapp.vercel.app/api/clock-in?limit=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!recentResponse.ok) {
        throw new Error('Failed to fetch recent clock-in data');
      }

      const recentData = await recentResponse.json();
      
      if (recentData.success) {
        setRecentClockIns(recentData.data);
      }
    } catch (error) {
      console.error('Error fetching clock-in data:', error);
      Alert.alert('Error', 'Failed to fetch clock-in data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleClockIn = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
      return;
    }

    if (!token) {
      Alert.alert('Authentication Error', 'You need to be logged in to clock in.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: addressString
        },
        notes: notes,
        image: "" // Optional: Handle image upload in a real implementation
      };

      const response = await fetch('https://stratoliftapp.vercel.app/api/clock-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to clock in');
      }

      // Update the active clock in
      setActiveClockIn(data.data);
      setNotes('');
      
      // Show success message
      Alert.alert(
        'Success',
        'You have successfully clocked in!',
        [{ text: 'OK' }]
      );
      
      // Refresh the data
      fetchClockInData();
    } catch (error) {
      console.error('Clock in error:', error);
      Alert.alert('Error', error.message || 'Failed to clock in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeClockIn) {
      Alert.alert('Error', 'No active clock-in found.');
      return;
    }

    if (!token) {
      Alert.alert('Authentication Error', 'You need to be logged in to clock out.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: activeClockIn._id,
        notes: notes || activeClockIn.notes
      };

      const response = await fetch('https://stratoliftapp.vercel.app/api/clock-in', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to clock out');
      }

      // Clear active clock in
      setActiveClockIn(null);
      setNotes('');
      
      // Show success message
      Alert.alert(
        'Success',
        'You have successfully clocked out!',
        [{ text: 'OK' }]
      );
      
      // Refresh the data
      fetchClockInData();
    } catch (error) {
      console.error('Clock out error:', error);
      Alert.alert('Error', error.message || 'Failed to clock out. Please try again.');
    } finally {
      setSubmitting(false);
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

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLocation();
    fetchClockInData();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#ffffff', '#fafafa']}
        className="pt-2 pb-4"
      >
        <View className="flex-row justify-between items-center px-5 pb-1">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeftIcon size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-geist-bold text-gray-800">Clock In/Out</Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <CalendarDaysIcon size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Status Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginHorizontal: 20,
            marginTop: 16,
          }}
        >
          <LinearGradient
            colors={activeClockIn ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 rounded-2xl shadow-lg"
            style={{
              shadowColor: activeClockIn ? '#10B981' : '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="bg-white/20 rounded-full p-3">
                <ClockIcon size={24} color="#fff" />
              </View>
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 font-geist-semibold text-xs">
                  {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </Text>
              </View>
            </View>
            <Text className="text-white font-geist-bold text-xl mb-1">
              {activeClockIn ? 'Currently Clocked In' : 'Ready to Clock In'}
            </Text>
            <Text className="text-white/80 font-geist text-sm mb-4">
              {activeClockIn 
                ? `Since ${formatTime(activeClockIn.clockInTime)} (${formatTimeAgo(activeClockIn.clockInTime)})`
                : 'Track your work hours by clocking in'}
            </Text>
            
            {activeClockIn && (
              <TouchableOpacity 
                onPress={() => {}}
                className="bg-white/20 self-start rounded-lg px-4 py-2 flex-row items-center mt-1"
              >
                <Text className="text-white font-geist-semibold mr-2">View Details</Text>
                <ArrowRightIcon size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Current Location */}
        <View className="mt-6 mx-5">
          <Text className="text-lg font-geist-bold text-gray-800 mb-3">Current Location</Text>
          <View 
            className="bg-white rounded-xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            {loading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 mt-2 font-geist">Fetching your location...</Text>
              </View>
            ) : locationError ? (
              <View className="items-center py-4">
                <Text className="text-red-500 font-geist text-center">{locationError}</Text>
                <TouchableOpacity 
                  onPress={fetchLocation}
                  className="mt-3 bg-blue-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-blue-600 font-geist-semibold">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="flex-row items-start mb-3">
                  <View className="bg-blue-50 p-2 rounded-lg mr-3 mt-1">
                    <MapPinIcon size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-geist-semibold text-gray-800 mb-1">Your Current Location</Text>
                    <Text className="text-gray-500 text-sm font-geist">{addressString}</Text>
                  </View>
                </View>
                {currentLocation && (
                  <View className="bg-gray-50 p-3 rounded-lg flex-row justify-between">
                    <Text className="text-gray-600 text-xs font-geist">Lat: {currentLocation.latitude.toFixed(6)}</Text>
                    <Text className="text-gray-600 text-xs font-geist">Long: {currentLocation.longitude.toFixed(6)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Clock In/Out Form */}
        <View className="mt-6 mx-5">
          <Text className="text-lg font-geist-bold text-gray-800 mb-3">
            {activeClockIn ? 'Clock Out' : 'Clock In'}
          </Text>
          <View 
            className="bg-white rounded-xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            {/* Notes Input */}
            <View className="mb-4">
              <Text className="text-gray-500 mb-2 font-geist">Notes (Optional)</Text>
              <View className="border border-gray-200 rounded-lg relative">
                <TextInput
                  className="p-3 text-gray-700 font-geist min-h-[80px]"
                  placeholder={activeClockIn ? "Add notes about your work day..." : "Add notes for your clock-in..."}
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                  numberOfLines={3}
                />
                <View className="absolute right-2 bottom-2">
                  <PencilSquareIcon size={18} color="#9CA3AF" />
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              onPress={activeClockIn ? handleClockOut : handleClockIn}
              disabled={loading || submitting || locationError}
              className={`rounded-lg py-3 items-center ${
                loading || submitting || locationError 
                  ? 'bg-gray-300' 
                  : activeClockIn 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-geist-semibold">
                  {activeClockIn ? 'Clock Out' : 'Clock In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-6 mx-5 mb-4">
          <Text className="text-lg font-geist-bold text-gray-800 mb-3">Recent Activity</Text>
          <View 
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            {loading ? (
              <View className="items-center py-6">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 mt-2 font-geist">Loading your activity...</Text>
              </View>
            ) : recentClockIns.length === 0 ? (
              <View className="items-center py-6">
                <Image
                  source={require('../assets/no-activity.png')}
                  style={{ width: width * 0.25, height: width * 0.25, opacity: 0.8, marginBottom: 12 }}
                />
                <Text className="text-gray-700 font-geist-semibold">No recent activity</Text>
                <Text className="text-gray-500 text-center font-geist px-6 mt-1">
                  Your recent clock in/out history will appear here
                </Text>
              </View>
            ) : (
              recentClockIns.map((clockIn, index) => (
                <View 
                  key={clockIn._id} 
                  className={`p-4 ${index !== recentClockIns.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-start">
                    <View className={`p-2 rounded-lg mr-3 ${
                      clockIn.status === 'active' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      <ClockIcon size={20} color={clockIn.status === 'active' ? '#3B82F6' : '#10B981'} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-geist-semibold text-gray-800">
                          {clockIn.status === 'active' ? 'Clocked In' : 'Shift Completed'}
                        </Text>
                        <View className={`py-1 px-2 rounded-full ${
                          clockIn.status === 'active' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <Text className={`text-xs font-geist ${
                            clockIn.status === 'active' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {clockIn.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-gray-500 text-sm font-geist">
                          {formatDate(clockIn.clockInTime)}
                        </Text>
                        <Text className="text-gray-500 text-xs font-geist">
                          {formatTimeAgo(clockIn.clockInTime)}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row">
                          <Text className="text-gray-600 text-xs font-geist">
                            {formatTime(clockIn.clockInTime)}
                            {clockIn.clockOutTime && ` - ${formatTime(clockIn.clockOutTime)}`}
                          </Text>
                        </View>
                        {clockIn.clockOutTime && (
                          <Text className="text-gray-700 text-xs font-geist-semibold">
                            Duration: {formatDuration(clockIn.clockInTime, clockIn.clockOutTime)}
                          </Text>
                        )}
                      </View>
                      
                      {clockIn.notes && (
                        <Text className="text-gray-500 text-xs font-geist mt-2 bg-gray-50 p-2 rounded-lg">
                          {clockIn.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
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
        <TouchableOpacity 
          onPress={() => navigation.navigate('techniciandb')} 
          className="items-center px-3"
        >
          <HomeIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('techniciantasks')} 
          className="items-center px-3"
        >
          <InboxIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center px-3">
          <ClockIcon size={22} color="#3B82F6" />
          <Text className="text-xs mt-1 text-blue-600 font-geist-semibold">Clock-in</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('technicianprofile')} 
          className="items-center px-3"
        >
          <UserIcon size={22} color="#9CA3AF" />
          <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TechnicianClockIn;