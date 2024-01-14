import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  blockUser,
  isUserBlocked,
  removeUserFromChat,
  unblockUser,
} from "../utils/actions/chatActions";
import { getUserChats } from "../utils/actions/userActions";
import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const ContactScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userData = useSelector((state) => state.auth.userData);
  const currentUser = storedUsers[props.route.params.uid];

  const storedChats = useSelector((state) => state.chats.chatsData);
  const [commonChats, setCommonChats] = useState([]);

  const chatId = props.route.params.chatId;
  const chatData = chatId && storedChats[chatId];

  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const checkIfBlocked = async () => {
      const blockedStatus = await isUserBlocked(
        currentUser,
        props.route.params.chatUsers
      );

      setBlocked(blockedStatus);
    };

    checkIfBlocked();
  }, [userData, props.route.params.chatUsers]);

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChats(currentUser.uid);
      setCommonChats(
        Object.values(currentUserChats).filter(
          (cid) => storedChats[cid] && storedChats[cid].isGroupChat
        )
      );
    };

    getCommonUserChats();
  }, []);

  const removeFromChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, currentUser, chatData);

      props.navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  // console.log(props.route);

  // block user handler
  const blockUserHandler = async () => {
    try {
      await blockUser(userData.uid, currentUser.uid);
      setBlocked(true);
      Alert.alert("User Blocked", `${currentUser.firstName} has been blocked.`);
    } catch (error) {
      console.error("Failed to block user:", error);
      Alert.alert("Error", "Failed to block user. Please try again later.");
    }
  };

  // Unblock user handler
  const unblockUserHandler = async () => {
    try {
      await unblockUser(userData.uid, currentUser.uid);
      setBlocked(false);
      Alert.alert(
        "User unblocked",
        `You can now chat with the  ${currentUser.firstName}`
      );
    } catch (error) {
      console.error("Failed to block user:", error);
      Alert.alert("Error", "Failed to unblock user. Please try again later.");
    }
  };

  return (
    <View className="flex-1">
      <View
        className={`w-full flex-row items-center justify-between ${
          Platform.OS === "android" ? "mt-4" : "mt-8"
        } px-4`}
      >
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={32} color={"#555"} />
        </TouchableOpacity>

        {/* <TouchableOpacity>
          <Entypo name="dots-three-vertical" size={24} color="#555" />
        </TouchableOpacity> */}
      </View>

      {/* profile */}
      <View className="items-center justify-center">
        <View className="w-full px-4">
          <View className="px-4">
            <View style={styles.topContainer}>
              <ProfileImage
                uri={currentUser.photo_url}
                size={80}
                style={{ marginBottom: 20 }}
              />

              <PageTitle
                text={`${currentUser.firstName} ${currentUser.lastName}`}
              />
              {currentUser.about && (
                <Text style={styles.about} numberOfLines={2}>
                  {currentUser.about}
                </Text>
              )}
            </View>

            {commonChats.length > 0 && (
              <>
                <Text style={styles.heading}>
                  {commonChats.length}{" "}
                  {commonChats.length === 1 ? "Group" : "Groups"} in Common
                </Text>
                {commonChats.map((cid) => {
                  const chatData = storedChats[cid];
                  return (
                    <DataItem
                      key={cid}
                      title={chatData.chatName}
                      subTitle={chatData.latestMessageText}
                      type="link"
                      onPress={() =>
                        props.navigation.push("ChatScreen", { chatId: cid })
                      }
                      image={chatData.chatImage}
                    />
                  );
                })}
              </>
            )}

            {chatData &&
              chatData.isGroupChat &&
              (isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <SubmitButton
                  title="Remove from chat"
                  color={colors.red}
                  onPress={removeFromChat}
                />
              ))}
          </View>
        </View>
      </View>

      <View className="px-4 flex-1">
        {/* Report user button */}
        {blocked ? (
          <TouchableOpacity
            onPress={unblockUserHandler}
            style={{ marginTop: 20, backgroundColor: colors.red }}
            className="w-full px-4 py-2 rounded-xl my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Unblock {`${currentUser.firstName} ${currentUser.lastName}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={blockUserHandler}
            style={{ marginTop: 20, backgroundColor: colors.red }}
            className="w-full px-4 py-2 rounded-xl my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Block {`${currentUser.firstName} ${currentUser.lastName}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  about: {
    fontFamily: "medium",
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.grey,
  },
  heading: {
    fontFamily: "bold",
    letterSpacing: 0.3,
    color: colors.textColor,
    marginVertical: 8,
  },
});

export default ContactScreen;
