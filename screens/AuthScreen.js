import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PageContainer from "../components/PageContainer";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import colors from "../constants/colors";

import BgImage from "../assets/images/logo.jpeg";

const AuthScreen = (props) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const screenWidth = Math.round(Dimensions.get("window").width);

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex-1 items-center justify-start">
          <Image
            source={BgImage}
            className="h-96"
            style={{ width: screenWidth }}
            resizeMode="cover"
          />

          {/* main view */}
          <View className="w-full h-full bg-white rounded-tl-[90px] items-center justify-start py-6 px-6 space-y-6 -mt-44">
            <Text className="py-2 text-primaryText text-xl font-semibold">
              {isSignUp ? "Join Us!" : "Welcome Back!"}
            </Text>

            {/* Content Section */}
            <View className="w-full items-center justify-center">
              {/* register */}
              {isSignUp ? <SignUpForm /> : <SignInForm />}

              <View className="w-full items-center justify-center ">
                <TouchableOpacity
                  onPress={() => setIsSignUp((prevState) => !prevState)}
                  style={styles.linkContainer}
                >
                  <Text className="text-base font-semibold text-primaryBold">
                    {`${
                      isSignUp
                        ? "Have an account? sign in"
                        : "Don't have an account?  sign up"
                    }`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  linkContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  link: {
    color: colors.blue,
    fontFamily: "medium",
    letterSpacing: 0.3,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "50%",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default AuthScreen;
