import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Entypo,
  Feather,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

import backgroundImage from "../assets/images/chatBg.png";

import colors from "../constants/colors";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import {
  createChat,
  isUserBlocked,
  sendImage,
  sendTextMessage,
} from "../utils/actions/chatActions";
import ReplyTo from "../components/ReplyTo";
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import AwesomeAlert from "react-native-awesome-alerts";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import UserImage from "../assets/images/user.png";

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatList = useRef();

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const [blocked, setBlocked] = useState(false);
  const chatMessages = useSelector((state) => {
    if (!chatId) return [];

    const chatMessagesData = state.messages.messagesData[chatId];

    if (!chatMessagesData) return [];

    const messageList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({
        key,
        ...message,
      });
    }

    return messageList;
  });

  const chatData =
    (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};

  const getChatTitleFromName = () => {
    const otheruid = chatUsers.find((uid) => uid !== userData.uid);
    const otherUserData = storedUsers[otheruid];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  const getOtherChatImage = () => {
    const otheruid = chatUsers.find((uid) => uid !== userData.uid);
    const otherUserData = storedUsers[otheruid];

    return otherUserData?.photo_url ? otherUserData.photo_url : UserImage;
  };

  console.log("Image: ", getOtherChatImage());

  useEffect(() => {
    if (!chatData) return;

    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(),
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {chatId && (
              <Item
                title="Chat settings"
                iconName="settings-outline"
                onPress={() =>
                  chatData.isGroupChat
                    ? props.navigation.navigate("ChatSettings", { chatId })
                    : props.navigation.navigate("Contact", {
                        uid: chatUsers.find((uid) => uid !== userData.uid),
                      })
                }
              />
            )}
          </HeaderButtons>
        );
      },
    });
    setChatUsers(chatData.users);
  }, [chatUsers]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.uid, props.route.params.newChatData);
        setChatId(id);
      }

      const result = await sendTextMessage(
        id,
        userData,
        messageText,
        replyingTo && replyingTo.key,
        chatUsers
      );

      if (result.blocked) {
        setErrorBannerText("Message not sent. Sender is blocked.");
      }

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log("ERROR SENDING MSG", error.message);

      // if (error) {
      //   setErrorBannerText("Message failed to send");
      //   setTimeout(() => setErrorBannerText(""), 5000);
      // }
    }
  }, [messageText, chatId]);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.uid, props.route.params.newChatData);
        setChatId(id);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(
        id,
        userData,
        uploadUrl,
        replyingTo && replyingTo.key,
        chatUsers
      );
      setReplyingTo(null);

      setTimeout(() => setTempImageUri(""), 500);
    } catch (error) {
      console.log(error);
    }
  }, [isLoading, tempImageUri, chatId]);

  return (
    <View className="flex-1">
      {/* top */}
      <View className="w-full flex-row justify-around items-center bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center w-full py-12">
          {/* go back */}
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
          </TouchableOpacity>

          {/*  profile */}
          <View className="flex-row items-center justify-center space-x-3">
            <View className="w-12 h-12 rounded-full border border-white flex items-center justify-center">
              {chatData.isGroupChat ? (
                <FontAwesome5 name="users" size={24} color="#fbfbfb" />
              ) : (
                <Image
                  source={{
                    uri: getOtherChatImage(),
                  }}
                  style={{ height: 40, width: 40, borderRadius: 20 }}
                  resizeMode="cover"
                />
              )}
            </View>

            <View>
              <Text className="text-gray-50 text-base font-semibold capitalize ">
                {chatData.chatName === ""
                  ? getChatTitleFromName()
                  : chatData.chatName}
              </Text>
            </View>
          </View>
        </View>

        {/* icons */}

        <TouchableOpacity
          onPress={() =>
            chatData.isGroupChat
              ? props.navigation.navigate("ChatSettings", { chatId })
              : props.navigation.navigate("Contact", {
                  uid: chatUsers.find((uid) => uid !== userData.uid),
                  chatUsers: chatUsers,
                })
          }
        >
          <Entypo name="dots-three-vertical" size={24} color="#fbfbfb" />
        </TouchableOpacity>
      </View>

      <View className="w-full bg-white px-4 py-6 rounded-t-[50px] flex-1 -mt-10">
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <PageContainer style={{ backgroundColor: "transparent" }}>
            {!chatId && (
              <Bubble text="This is a new chat. Say hi!" type="system" />
            )}

            {blocked && (
              <Bubble
                text={`You blocked this contact. Unblock?`}
                type="system"
              />
            )}

            {errorBannerText !== "" && (
              <Bubble text={errorBannerText} type="error" />
            )}

            {chatId && (
              <FlatList
                ref={(ref) => (flatList.current = ref)}
                onContentSizeChange={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                onLayout={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;

                  const isOwnMessage = message.sentBy === userData.uid;

                  let messageType;
                  if (message.type && message.type === "info") {
                    messageType = "info";
                  } else if (isOwnMessage) {
                    messageType = "myMessage";
                  } else {
                    messageType = "theirMessage";
                  }

                  const sender = message.sentBy && storedUsers[message.sentBy];
                  const name =
                    sender && `${sender.firstName} ${sender.lastName}`;

                  return (
                    <Bubble
                      type={messageType}
                      text={message.text}
                      messageId={message.key}
                      uid={userData.uid}
                      chatId={chatId}
                      date={message.sentAt}
                      name={
                        !chatData.isGroupChat || isOwnMessage ? undefined : name
                      }
                      setReply={() => setReplyingTo(message)}
                      replyingTo={
                        message.replyTo &&
                        chatMessages.find((i) => i.key === message.replyTo)
                      }
                      imageUrl={message.imageUrl}
                    />
                  );
                }}
              />
            )}
          </PageContainer>

          {replyingTo && (
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sentBy]}
              onCancel={() => setReplyingTo(null)}
            />
          )}
        </ImageBackground>

        {!blocked && (
          <View className="w-full flex-row items-center justify-center px-8 space-x-2">
            <View className="bg-gray-200 rounded-2xl px-4 space-x-4 py-2 flex-row items-center justify-between">
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Feather name="image" size={24} color={colors.primary} />
              </TouchableOpacity>

              <AwesomeAlert
                show={tempImageUri !== ""}
                title="Send image?"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Cancel"
                confirmText="Send image"
                confirmButtonColor={colors.primary}
                cancelButtonColor={colors.red}
                titleStyle={styles.popupTitleStyle}
                onCancelPressed={() => setTempImageUri("")}
                onConfirmPressed={uploadImage}
                onDismiss={() => setTempImageUri("")}
                customView={
                  <View>
                    {isLoading && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                    {!isLoading && tempImageUri !== "" && (
                      <Image
                        source={{ uri: tempImageUri }}
                        style={{ width: 200, height: 200 }}
                      />
                    )}
                  </View>
                }
              />

              <TextInput
                className="flex-1 h-8 text-base text-primaryText font-semibold"
                value={messageText}
                onChangeText={(text) => setMessageText(text)}
                onSubmitEditing={sendMessage}
              />
            </View>

            <TouchableOpacity className="pl-4">
              {/* <FontAwesome name="send" size={24} color="#555" /> */}
              {messageText === "" && (
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={takePhoto}
                >
                  <Feather name="camera" size={24} color="#555" />
                </TouchableOpacity>
              )}

              {messageText !== "" && (
                <TouchableOpacity
                  style={{ ...styles.mediaButton, ...styles.sendButton }}
                  onPress={sendMessage}
                >
                  <Feather name="send" size={20} color={"white"} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 8,
  },
  popupTitleStyle: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: colors.textColor,
  },
});

export default ChatScreen;
