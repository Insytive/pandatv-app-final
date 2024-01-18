import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import colors from "../constants/colors";
import Logo from "../assets/images/4.png";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import UserImage from "../assets/images/user.png";

const ChatListScreen = (props) => {
  const selectedUser = props.route?.params?.selecteduid;
  const selectedUserList = props.route?.params?.selectedUsers;
  const chatName = props.route?.params?.chatName;

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userChats = useSelector((state) => {
    const chatsData = state.chats.chatsData;
    return Object.values(chatsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New chat"
              iconName="create-outline"
              onPress={() => props.navigation.navigate("NewChat")}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedUser && !selectedUserList) {
      return;
    }

    let chatData;
    let navigationProps;

    if (selectedUser) {
      chatData = userChats.find(
        (cd) => !cd.isGroupChat && cd.users.includes(selectedUser)
      );
    }

    if (chatData) {
      navigationProps = { chatId: chatData.key };
    } else {
      const chatUsers = selectedUserList || [selectedUser];
      if (!chatUsers.includes(userData.uid)) {
        chatUsers.push(userData.uid);
      }

      navigationProps = {
        newChatData: {
          users: chatUsers,
          isGroupChat: selectedUserList !== undefined,
          chatName,
        },
      };
    }

    props.navigation.navigate("ChatScreen", navigationProps);
  }, [props.route?.params]);

  return (
    <SafeAreaView className="flex-1">
      <View className="w-full flex-row items-center justify-between px-4 py-2">
        <Image
          source={Logo}
          className="w-12 h-12"
          resizeMode="contain"
          style={{ height: 80, width: 120 }}
        />

        <TouchableOpacity
          onPress={() => props.navigation.navigate("Settings")}
          className="w-12 h-12 rounded-full border border-primary flex items-center justify-center"
        >
          <Image
            source={{
              uri: userData ? userData.photo_url : UserImage,
            }}
            style={{ height: 40, width: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <View className="w-full px-4 flex-1 pt-4">
        <View className="w-full">
          {/* message title and add */}
          <View className="w-full flex-row items-center justify-between px-2">
            <Text className="text-primaryText text-base font-extrabold pb-2">
              New Message
            </Text>

            <TouchableOpacity
              onPress={() => props.navigation.navigate("NewChat")}
            >
              <Ionicons name="chatbox" size={28} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Chat Item */}
          <FlatList
            data={userChats}
            renderItem={(itemData) => {
              const chatData = itemData.item;
              const chatId = chatData.key;
              const isGroupChat = chatData.isGroupChat;

              let title = "";
              const subTitle = chatData.latestMessageText || "New chat";
              let image = "";

              if (isGroupChat) {
                title = chatData.chatName;
                image = chatData.chatImage;
              } else {
                const otheruid = chatData.users.find(
                  (uid) => uid !== userData.uid
                );
                const otherUser = storedUsers[otheruid];



                if (!otherUser) return;

                const isVerified = otherUser.email && otherUser.email.includes('skillspanda');


                title = `${otherUser.firstName} ${otherUser.lastName}`;
                verifiedIcon = isVerified ? <MaterialIcons name="verified" size={16} color="#056526" /> : null;

                image = otherUser.photo_url;
              }

              return (
                <DataItem
                  title={title}
                  subTitle={subTitle}
                  verifiedIcon={verifiedIcon}
                  image={image}
                  onPress={() =>
                    props.navigation.navigate("ChatScreen", { chatId })
                  }
                />
              );
            }}
          />
        </View>
      </View>

      <View className="w-full px-4 py-6">
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate("NewChat", { isGroupChat: true })
          }
        >
          <View style={styles.groupCreate}>
            <Feather name="users" size={24} color={colors.primary} />
            <Text style={styles.newGroupText}>Create Group</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupCreate: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 70,
    width: 120,
    borderRadius: 15,
    backgroundColor: "#f44f0827",
    alignItems: "center",
  },

  newGroupText: {
    fontWeight: "600",
    paddingTop: 3,
    fontSize: 14,
    marginBottom: 5,
  },
});

export default ChatListScreen;
