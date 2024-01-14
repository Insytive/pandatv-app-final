import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { searchUsers } from "../utils/actions/userActions";
import DataItem from "../components/DataItem";
import { useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "../store/userSlice";
import ProfileImage from "../components/ProfileImage";

const NewChatScreen = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const selectedUsersFlatList = useRef();

  const chatId = props.route.params && props.route.params.chatId;
  const existingUsers = props.route.params && props.route.params.existingUsers;
  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const isGroupChatDisabled =
    selectedUsers.length === 0 || (isNewChat && chatName === "");

  const isNewChat = !chatId;

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title={isNewChat ? "Create" : "Add"}
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? colors.lightGrey : undefined}
                onPress={() => {
                  const screenName = isNewChat ? "ChatList" : "ChatSettings";
                  props.navigation.navigate(screenName, {
                    selectedUsers,
                    chatName,
                    chatId,
                  });
                }}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? "Add participants" : "New chat",
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === "") {
        setUsers();
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      const usersResult = await searchUsers(searchTerm);
      delete usersResult[userData.uid];
      setUsers(usersResult);

      if (Object.keys(usersResult).length === 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);

        dispatch(setStoredUsers({ newUsers: usersResult }));
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = (uid) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(uid)
        ? selectedUsers.filter((id) => id !== uid)
        : selectedUsers.concat(uid);

      setSelectedUsers(newSelectedUsers);
    } else {
      props.navigation.navigate("ChatList", {
        selecteduid: uid,
        chatName: "",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* top */}
      <View className="w-full bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center justify-between w-full px-4 py-12">
          {/* go back */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white">
              {" "}
              {isGroupChat ? "Add participants" : "New chat"}{" "}
            </Text>
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
      {/* bottom section */}

      <View className="w-full bg-white px-4 py-6 rounded-t-[50px] flex-1  -mt-10">
        <View className="w-full px-4 py-4">
          {isNewChat && isGroupChat && (
            <View style={styles.chatNameContainer}>
              <View
                className={`border rounded-2xl px-4 py-4 flex-row items-center justify-between space-x-4 my-2`}
              >
                <TextInput
                  style={styles.textbox}
                  placeholder="Group Name (Required)"
                  className="flex-1 text-base text-primaryText font-semibold -mt-1"
                  autoCorrect={false}
                  // autoComplete={false}
                  onChangeText={(text) => setChatName(text)}
                />
              </View>
            </View>
          )}

          {isGroupChat && (
            <View style={styles.selectedUsersContainer}>
              <FlatList
                style={styles.selectedUsersList}
                data={selectedUsers}
                horizontal={true}
                keyExtractor={(item) => item}
                contentContainerStyle={{ alignItems: "center" }}
                ref={(ref) => (selectedUsersFlatList.current = ref)}
                onContentSizeChange={() =>
                  selectedUsersFlatList.current.scrollToEnd()
                }
                renderItem={(itemData) => {
                  const uid = itemData.item;
                  const userData = storedUsers[uid];
                  return (
                    <ProfileImage
                      style={styles.selectedUserStyle}
                      size={40}
                      uri={userData.photo_url}
                      onPress={() => userPressed(uid)}
                      showRemoveButton={true}
                    />
                  );
                }}
              />
            </View>
          )}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={15} color={colors.lightGrey} />

            <TextInput
              placeholder="Search by name..."
              style={styles.searchBox}
              onChangeText={(text) => setSearchTerm(text)}
            />
          </View>
          {isLoading && (
            <View style={commonStyles.center}>
              <ActivityIndicator size={"small"} color={colors.primary} />
            </View>
          )}
          {!isLoading && !noResultsFound && users && (
            <FlatList
              data={Object.keys(users)}
              renderItem={(itemData) => {
                const uid = itemData.item;
                const userData = users[uid];

                if (existingUsers && existingUsers.includes(uid)) {
                  return;
                }

                return (
                  <DataItem
                    title={`${userData.firstName} ${userData.lastName}`}
                    subTitle={userData.about}
                    image={userData.photo_url}
                    onPress={() => userPressed(uid)}
                    type={isGroupChat ? "checkbox" : ""}
                    isChecked={selectedUsers.includes(uid)}
                  />
                );
              }}
            />
          )}
          {!isLoading && noResultsFound && (
            <View style={commonStyles.center}>
              <FontAwesome
                name="question"
                size={55}
                color={colors.lightGrey}
                style={styles.noResultsIcon}
              />
              <Text style={styles.noResultsText}>No users found!</Text>
            </View>
          )}
          {!isLoading && !users && (
            <View style={commonStyles.center}>
              <FontAwesome
                name="users"
                size={55}
                color={colors.lightGrey}
                style={styles.noResultsIcon}
              />
              <Text style={styles.noResultsText}>
                Enter a name to search for a user!
              </Text>
            </View>
          )}
        </View>

        {isGroupChat && (
          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                backgroundColor: isGroupChatDisabled
                  ? colors.lightGrey
                  : colors.primary,
              },
            ]}
            disabled={isGroupChatDisabled}
            onPress={() => {
              const screenName = isNewChat ? "ChatList" : "ChatSettings";
              props.navigation.navigate(screenName, {
                selectedUsers,
                chatName,
                chatId,
              });
            }}
          >
            <Text style={styles.buttonText}>
              {isNewChat ? (
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={isGroupChatDisabled ? "#333" : "#fff"}
                />
              ) : (
                "Add"
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.extraLightGrey,
    height: 30,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
    height: 30,
    borderRadius: 10,
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.nearlyWhite,
    flexDirection: "row",
    borderRadius: 2,
  },
  textbox: {
    color: colors.textColor,
    width: "100%",
    letterSpacing: 0.3,
    borderRadius: 10,
  },
  selectedUsersContainer: {
    height: 50,
    justifyContent: "center",
  },
  selectedUsersList: {
    height: "100%",
    paddingTop: 10,
  },
  selectedUserStyle: {
    marginRight: 10,
    marginBottom: 10,
  },

  floatingButton: {
    position: "absolute",
    backgroundColor: colors.primary,
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default NewChatScreen;
