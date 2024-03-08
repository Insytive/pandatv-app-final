import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ChatSettingsScreen from "../screens/ChatSettingsScreen";
import StoreScreen from "../screens/EstoreScreen/StoreScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import { setChatsData } from "../store/chatSlice";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
} from "react-native";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { setStoredUsers } from "../store/userSlice";
import { setChatMessages, setStarredMessages } from "../store/messagesSlice";
import ContactScreen from "../screens/ContactScreen";
import DataListScreen from "../screens/DataListScreen";
import { StackActions, useNavigation } from "@react-navigation/native";
import JobApplicationScreen from "../screens/JobApplicationScreen";
import OpportunitiesScreen from "../screens/OpportunitiesScreen";

// Community imports
import CommunityScreen from "../screens/CommunityScreen/CommunityScreen";
import FeedDetailScreen from "../screens/FeedDetailScreen/FeedsDetailScreen";
import NewFeedScreen from "../screens/NewFeedScreen/NewFeedScreen";
import EditFeedScreen from "../screens/EditFeedScreen/EditFeedScreen";
import LocalOpportunityScreen from "../screens/LocalOpportunityScreen";
import axios from "axios";

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
// This will manage notifications when they are received in the foreground of the app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // Should the notification be shown as alert
    shouldPlaySound: true,  // Should a sound be played
    shouldSetBadge: false,  // Should a badge count be set
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? Styles.activeIconBackground : Styles.iconBackground
              }
            >
              <Ionicons
                name={focused ? "md-chatbubbles" : "md-chatbubbles-outline"}
                size={20}
                color="#333"
              />
            </View>
          ),
          tabBarActiveTintColor: "#383838",
          tabBarInactiveTintColor: "#383838",
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
          },
        }}
      />
      <Tab.Screen
        name="OpportunitiesScreen"
        options={{
          tabBarLabel: "Opportunities",
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? Styles.activeIconBackground : Styles.iconBackground
              }
            >
              <Ionicons
                name={focused ? "md-briefcase" : "md-briefcase-outline"}
                size={20}
                color="#333"
              />
            </View>
          ),
          tabBarActiveTintColor: "#333",
          tabBarInactiveTintColor: "#333",
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
          },
        }}
        component={OpportunitiesScreen}
      />

      <Tab.Screen
        name="CommunityScreen"
        screenOptions={{ headerShown: false }}
        options={{
          tabBarLabel: "Community",
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? Styles.activeIconBackground : Styles.iconBackground
              }
            >
              <Ionicons
                name={focused ? "people-sharp" : "md-people-outline"}
                size={20}
                color="#333"
              />
            </View>
          ),
          tabBarActiveTintColor: "#383838",
          tabBarInactiveTintColor: "#383838",
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
          },
        }}
        component={CommunityScreen}
      />

      <Tab.Screen
        name="eStore"
        component={StoreScreen}
        options={{
          tabBarLabel: "eStore",
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? Styles.activeIconBackground : Styles.iconBackground
              }
            >
              <Ionicons
                name={focused ? "md-cart" : "md-cart-outline"}
                size={20}
                color="#333"
              />
            </View>
          ),
          tabBarActiveTintColor: "#333",
          tabBarInactiveTintColor: "#333",
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
          },
        }}
      />

    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen name="JobApplication" component={JobApplicationScreen} />
        <Stack.Screen
          name="LocalOpportunity"
          component={LocalOpportunityScreen}
        />

        <Stack.Screen name="eStore" component={StoreScreen} />

        <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
        <Stack.Screen name="NewFeedScreen" component={NewFeedScreen} />
        <Stack.Screen name="EditFeedScreen" component={EditFeedScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{
            headerTitle: "Contact info",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: "containedModal" }}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

// This function is used to ask for permissions and to get the Expo Push Token
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log("Push Token", token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}

const MainNavigator = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Function to re-register for push notifications
  const reRegisterForPushNotificationsAsync = async () => {
    try {
      const newToken = await registerForPushNotificationsAsync();
      console.log("Expo Push Token (Re-registered): ", newToken);
      setExpoPushToken(newToken);
    } catch (error) {
      console.error("Error while re-registering for push notifications: ", error);
    }
  };

  const handleNotificationResponse = (response) => {
    /* Here you might want to handle user's response to a notification */
    const { data } = response.notification.request.content;
    const chatId = data["chatId"];

    if (chatId) {
      const pushAction = StackActions.push("ChatScreen", { chatId });
      navigation.dispatch(pushAction);
    } else {
      console.log("No chat id sent with notification");
    }
    
    // Obtain push receipt for this notification
    getPushReceipt(response.notification.request.identifier);
  };

  const getPushReceipt = async (notificationIdentifier) => {
    try {
      const response = await fetch(`https://exp.host/--/api/v2/push/getReceipts`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [notificationIdentifier] }),
      });
  
      const receiptData = await response.json();
      console.log("Push Receipt Data:", receiptData);
  
      // Send the receipt data to your Laravel backend
      sendReceiptToBackend(receiptData);
    } catch (error) {
      console.error("Error while getting push receipt:", error);
    }
  };
  
  const sendReceiptToBackend = async (receiptData) => {
    try {
      const response = await axios.post(
        'https://admin.pandatv.co.za/api/push-receipt',
        { receiptData },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log("Receipt data sent to backend:", response.data);
    } catch (error) {
      console.error("Error while sending receipt data to backend:", error);
    }
  };  

  useEffect(() => {

    if (!userData) {
      // If userData is null or undefined, handle the situation accordingly
      // For example, you may want to redirect the user to the login screen
      console.error("User data is null or undefined");
      return;
    }

    // Register for notifications
    console.log("Registering for push notifications");
    registerForPushNotificationsAsync().then(token => {
      console.log("Expo Push Token: ", token);
      setExpoPushToken(token)
    }).catch(error => console.log("Error while registering for push notifications: ", error));

    // Listener for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      /* Here you might want to handle the notification when it arrives */
      setNotification(notification);
    });

    // Listener for responses to notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      /* Here you might want to handle user's response to a notification */
      const { data } = response.notification.request.content;
      const chatId = data["chatId"];

      if (chatId) {
        const pushAction = StackActions.push("ChatScreen", { chatId });
        navigation.dispatch(pushAction);
      } else {
        console.log("No chat id sent with notification");
      }
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userData]);

  useEffect(() => {
    if (expoPushToken) {
      // Obtain Bearer Token for authentication
      const getBearerToken = async () => {
        try {
          const response = await axios.post(
            "https://admin.pandatv.co.za/oauth/token",
            {
              grant_type: "password",
              client_id: "5", // Replace with your client_id
              client_secret: "ynK96ZnHK1nH2ZR10MSYMrte7UOR8lQEPmiQZnZF", // Replace with your client_secret
              username: "kylemabaso@gmail.com", // Replace with user's email or username
              password: "password", // Replace with user's password
              scope: "",
            }
          );

          const bearerToken = response.data.access_token;
          console.log("Bearer Token:", bearerToken);

          // Subscribe to push notifications on your Laravel server with Bearer Token
          try {
            axios.post(
              "https://admin.pandatv.co.za/api/register-device",
              { device_token: expoPushToken },
              { headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearerToken}` } }
            );
            console.log("Successfully subscribed to Panda TV");
          } catch (error) {
            console.error("Error while subscribing to Panda TV: ", error);
            // If there's an error, attempt to re-register for push notifications
            reRegisterForPushNotificationsAsync();
          }
        } catch (error) {
          console.error("Error obtaining Bearer Token:", error);
        }
      };

      getBearerToken();
    }
  }, [expoPushToken]);

  useEffect(() => {
    console.log("Subscribing to firebase listeners");

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userChatsRef = child(dbRef, `userChats/${userData.uid}`);
    const refs = [userChatsRef];

    onValue(userChatsRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatsFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);
        refs.push(chatRef);

        onValue(chatRef, (chatSnapshot) => {
          chatsFoundCount++;

          const data = chatSnapshot.val();

          if (data) {
            if (!data.users.includes(userData.uid)) {
              return;
            }

            data.key = chatSnapshot.key;

            data.users.forEach((uid) => {
              if (storedUsers[uid]) return;

              const userRef = child(dbRef, `users/${uid}`);

              get(userRef).then((userSnapshot) => {
                const userSnapshotData = userSnapshot.val();
                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
              });

              refs.push(userRef);
            });

            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        });

        const messagesRef = child(dbRef, `messages/${chatId}`);
        refs.push(messagesRef);

        onValue(messagesRef, (messagesSnapshot) => {
          const messagesData = messagesSnapshot.val();
          dispatch(setChatMessages({ chatId, messagesData }));
        });

        if (chatsFoundCount == 0) {
          setIsLoading(false);
        }
      }
    });

    const userStarredMessagesRef = child(
      dbRef,
      `userStarredMessages/${userData.uid}`
    );
    refs.push(userStarredMessagesRef);
    onValue(userStarredMessagesRef, (querySnapshot) => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessages({ starredMessages }));
    });

    // Listener for responses to notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    const handleNotification = (notification) => {
      /* Here you might want to handle the notification when it arrives in the foreground */
      console.log("Foreground Notification:", notification);
    
      // Extract necessary data from the notification and navigate accordingly
      const { data } = notification.request.content;
      const chatId = data["chatId"];
    
      if (chatId) {
        const pushAction = StackActions.push("ChatScreen", { chatId });
        navigation.dispatch(pushAction);
      } else {
        console.log("No chat id sent with notification");
      }
    };
    

    return () => {
      console.log("Unsubscribing firebase listeners");
      refs.forEach((ref) => off(ref));
    };
  }, []);

  if (isLoading) {
    <View style={commonStyles.center}>
      <ActivityIndicator size={"large"} color={colors.primary} />
    </View>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      <StackNavigator />
    </KeyboardAvoidingView>
  );
};

export default MainNavigator;

const Styles = StyleSheet.create({
  iconBackground: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#f44f0814",
    justifyContent: "center",
    alignItems: "center",
  },
});