import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  addUsersToChat,
  removeUserFromChat,
  updateChatData,
} from "../utils/actions/chatActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import { MaterialIcons } from "@expo/vector-icons";

const ChatSettingsScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const chatId = props.route.params.chatId;
  const chatData = useSelector((state) => state.chats.chatsData[chatId] || {});
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId] ?? {}
  );

  const initialState = {
    inputValues: { chatName: chatData.chatName },
    inputValidities: { chatName: undefined },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const selectedUsers = props.route.params && props.route.params.selectedUsers;
  useEffect(() => {
    if (!selectedUsers) {
      return;
    }

    const selectedUserData = [];
    selectedUsers.forEach((uid) => {
      if (uid === userData.uid) return;

      if (!storedUsers[uid]) {
        console.log("No user data found in the data store");
        return;
      }

      selectedUserData.push(storedUsers[uid]);
    });

    addUsersToChat(userData, selectedUserData, chatData);
  }, [selectedUsers]);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.uid, updatedValues);

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1500);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return currentValues.chatName != chatData.chatName;
  };

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, userData, chatData);

      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  if (!chatData.users) return null;

  return (
    <View className="flex-1">
      <View className="w-full bg-primary px-4 py-6 ]">
        <View className="flex-row items-center justify-between w-full px-4 py-12">
          {/* go back */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> Chat Settings </Text>
          </View>

          {/* user profile */}
          <View className="flex-row items-center justify-center space-x-3">
            <Image
              source={{ uri: userData?.photo_url }}
              className="w-12 h-12"
              resizeMode="contain"
              style={{ height: 30, width: 30, borderRadius: 15 }}
            />
          </View>
        </View>
      </View>

      <View className="w-full px-4">
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View className="mt-4">
            <ProfileImage
              showEditButton={true}
              size={80}
              chatId={chatId}
              uid={userData.uid}
              uri={chatData.chatImage}
            />
          </View>

          <Input
            id="chatName"
            label="Group Name"
            autoCapitalize="none"
            initialValue={chatData.chatName}
            allowEmpty={false}
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities["chatName"]}
          />

          <View style={styles.sectionContainer}>
            <Text style={styles.heading}>
              {chatData.users.length} Participants
            </Text>

            <DataItem
              title="Add users"
              icon="plus"
              type="button"
              onPress={() =>
                props.navigation.navigate("NewChat", {
                  isGroupChat: true,
                  existingUsers: chatData.users,
                  chatId,
                })
              }
            />

            {chatData.users.slice(0, 4).map((uid) => {
              const currentUser = storedUsers[uid];
              return (
                <DataItem
                  key={uid}
                  image={currentUser.photo_url}
                  title={`${currentUser.firstName} ${currentUser.lastName}`}
                  subTitle={currentUser.about}
                  type={uid !== userData.uid && "link"}
                  onPress={() =>
                    uid !== userData.uid &&
                    props.navigation.navigate("Contact", { uid, chatId })
                  }
                />
              );
            })}

            {chatData.users.length > 4 && (
              <DataItem
                type={"link"}
                title="View all"
                hideImage={true}
                onPress={() =>
                  props.navigation.navigate("DataList", {
                    title: "Participants",
                    data: chatData.users,
                    type: "users",
                    chatId,
                  })
                }
              />
            )}
          </View>

          {showSuccessMessage && <Text>Saved!</Text>}

          {isLoading ? (
            <ActivityIndicator size={"small"} color={colors.primary} />
          ) : (
            hasChanges() && (
              <SubmitButton
                title="Save changes"
                color={colors.primary}
                onPress={saveHandler}
                disabled={!formState.formIsValid}
              />
            )
          )}

          <DataItem
            type={"link"}
            title="Starred messages"
            hideImage={true}
            onPress={() =>
              props.navigation.navigate("DataList", {
                title: "Starred messages",
                data: Object.values(starredMessages),
                type: "messages",
              })
            }
          />
        </ScrollView>

        {
          // <SubmitButton
          //   title="Leave chat"
          //   color={colors.red}
          //   onPress={() => leaveChat()}
          //   style={{ marginBottom: 20 }}
          // />

          <TouchableOpacity
            onPress={() => leaveChat()}
            style={{ marginTop: 20, backgroundColor: colors.red }}
            className="w-full px-4 py-2 rounded-xl my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Leave Chat
            </Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: colors.textColor,
    fontFamily: "bold",
    letterSpacing: 0.3,
  },
});

export default ChatSettingsScreen;
