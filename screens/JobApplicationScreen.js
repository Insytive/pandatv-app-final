import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const JobApplicationScreen = ({ route }) => {
  const navigation = useNavigation();

  const { url, title } = route.params;

  return (
    <>
      {/* top */}
      <View className="w-full bg-primary px-4 flex-[0.25]">
        <View className="flex-row items-center  w-full px-4 py-12">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> {title} </Text>
          </View>

          {/* user profile */}
          {/* <View className="flex-row items-center justify-center space-x-3">
            <Image
              source={{ uri: user?.photo_url }}
              className="w-12 h-12"
              resizeMode="contain"
              style={{ height: 30, width: 30, borderRadius: 15 }}
            />
          </View> */}
        </View>
      </View>

      <View className="w-full bg-white px-4 py-6  flex-1 -mt-10">
        <WebView source={{ uri: url }} />
      </View>
    </>
  );
};

export default JobApplicationScreen;
