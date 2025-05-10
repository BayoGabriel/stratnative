import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, Image } from 'react-native';
import { ArrowRightIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useRouter } from 'expo-router';
const { width } = Dimensions.get('window');

export default function StratoliftOnboarding() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const timerRef = useRef(null);
  const tiltAnim1 = useRef(new Animated.Value(0)).current;
  const tiltAnim2 = useRef(new Animated.Value(0)).current;
  const tiltAnim3 = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  // First image is splash screen, then 3 carousel items
  useEffect(() => {
    // Show splash for 2 seconds before showing the carousel
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(splashTimer);
  }, []);
  
  // Handle carousel auto-scrolling
  useEffect(() => {
    if (!showSplash && currentPage < 2) {
      timerRef.current = setTimeout(() => {
        setCurrentPage(prev => prev + 1);
      }, 5000); // 5 seconds between carousel slides
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentPage, showSplash]);
  useEffect(() => {
    const tilt = (anim, toDeg) => {
      Animated.timing(anim, {
        toValue: toDeg,
        duration: 3000,
        useNativeDriver: true,
      }).start();
    };
  
    if (currentPage === 0) {
      tilt(tiltAnim1, 3);
    } else if (currentPage === 1) {
      tilt(tiltAnim2, -3);
    } else if (currentPage === 2) {
      tilt(tiltAnim3, 3);
    }
  }, [currentPage]);
  const tiltStyle1 = {
    transform: [
      {
        rotate: tiltAnim1.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        }),
      },
    ],
  };
  
  const tiltStyle2 = {
    transform: [
      {
        rotate: tiltAnim2.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        }),
      },
    ],
  };
  
  const tiltStyle3 = {
    transform: [
      {
        rotate: tiltAnim3.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        }),
      },
    ],
  };
    
  const handleSkip = () => {
    setCurrentPage(2); // Skip to the last carousel item
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleContinue = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      router.push('/auth');
    }
  };

  // Splash screen (Image 1)
  if (showSplash) {
    return (
      <View className="flex-1 items-center justify-center">
        {/* Background Image */}
        <Image
          source={require('../assets/bg.jpg')}
          className="absolute top-0 left-0 w-full h-full"
          resizeMode="cover"
        />

        {/* Foreground content */}
        <Image
          source={require('../assets/redlogo.png')}
          className="w-full"
          resizeMode="contain"
        />
      </View>
    );
  }

  // Render dot indicators for the carousel
  const renderDots = () => {
    return (
      <View className="flex-row justify-center gap-3 mt-4">
        {[0, 1, 2].map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentPage === index ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
    );
  };

  // Render the carousel screens (Images 2-4)
  return (
    <View className="flex-1 bg-[#f2c2c22f]">
      {/* Skip button */}
      {currentPage < 2 && (
        <TouchableOpacity
          onPress={handleSkip}
          className="absolute top-3 right-4 z-20"
        >
          <Text className="text-primary font-geist-semi-bold text-[16px] font-medium">Skip</Text>
        </TouchableOpacity>
      )}
      
      {/* Carousel content */}
      <View className="flex-1 px-6 pt-24 pb-6">
        {currentPage === 0 && (
          <>
            {/* Welcome screen - Image 2 */}
            <View className="mb-6">
              <Animated.View style={tiltStyle1}>
                <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 shadow-sm">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                      <Text className="text-primary">👤</Text>
                    </View>
                    <Text className="text-base font-medium">Request Visit</Text>
                  </View>
                  <ArrowRightIcon color="#000" size={16} />
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={tiltStyle2}>
              <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="text-blue-500">🔧</Text>
                  </View>
                  <Text className="text-base font-medium">Maintenance</Text>
                </View>
                <ArrowRightIcon color="#000" size={16} />
              </TouchableOpacity>
              </Animated.View>
              <Animated.View style={tiltStyle3}>
              <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-3">
                    <ExclamationTriangleIcon color="#ffcc00" size={20} />
                  </View>
                  <Text className="text-base font-medium">Report Issue</Text>
                </View>
                <ArrowRightIcon color="#000" size={16} />
              </TouchableOpacity>
              </Animated.View>
            </View>
            
            <View className="mt-auto px-4 mb-10">
              <Text className="text-[25px] font-lato-bold text-center font-bold">Welcome to Stratolift</Text>
              <Text className="text-black mt-2 mb-6 text-center font-lato text-[16px]">
                Effortlessly manage elevator service requests, schedule appointments, and get real-time updates.
              </Text>
              {renderDots()}
            </View>
          </>
        )}
        
        {currentPage === 1 && (
          <>
            {/* Report Issues screen - Image 3 */}
            <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
              <View className="items-center mb-4">
                <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                  <CheckIcon color="white" size={20} />
                </View>
                <Text className="text-lg font-bold">Thank You</Text>
                <Text className="text-gray-500 text-center">
                  Your elevator emergency has been reported successfully
                </Text>
              </View>
              
              <View className="bg-gray-100 rounded-lg p-3 flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2">
                  <Image source={require("../assets/stuck.png")}/>
                </View>
                <Text className="text-[14px] font-lato-black">Elevator is stuck or not moving</Text>
              </View>
            </View>
            
            <View className="mt-auto px-4 mb-10">
              <Text className="text-[25px] font-lato-bold text-center font-bold">Report Issues Instantly</Text>
              <Text className="text-black mt-2 mb-6 text-center font-lato text-[16px]">
                Easily submit service request and upload photos for faster resolution.
              </Text>
              {renderDots()}
            </View>
          </>
        )}
        
        {currentPage === 2 && (
          <>
            {/* Emergency Assistance screen - Image 4 */}
            <View className='p-2 bg-[#EC323733] rounded-xl'>
            <TouchableOpacity className="bg-primary rounded-xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-[50%] bg-[#fa9b9b] items-center justify-center mr-3">
                  <Image source={require("../assets/emergency.png")} />
                </View>
                <View className=''>
                  <Text className="text-white font-bold font-lato-bold text-[18px]">Emergency</Text>
                  <Text className="text-white font-lato-black mt-1 text-[14px]">Report an issue immediately</Text>
                </View>
              </View>
              <ArrowRightIcon color="white" size={16} />
            </TouchableOpacity>
            </View>
            
            <View className="mt-auto px-4 mb-10">
              <Text className="text-[25px] font-lato-bold text-center font-bold">Emergency Assistance at Your Fingertips</Text>
              <Text className="text-black mt-2 mb-6 text-center font-lato text-[16px]">
                Quickly request help during elevator emergencies.
              </Text>
              {renderDots()}
            </View>
          </>
        )}
      </View>
      
      {/* Bottom button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-full py-4 items-center"
        >
          <Text className="text-white text-[16px] font-geist-semi-bold font-medium">
            {currentPage === 2 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}