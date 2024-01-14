import {
  Entypo,
  Feather,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useCallback, useMemo, useReducer, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import Input from "../components/Input";
import ProfileImage from "../components/ProfileImage";
import colors from "../constants/colors";
import { updateLoggedInUserData } from "../store/authSlice";
import {
  updateSignedInUserData,
  userLogout,
} from "../utils/actions/authActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import Modal from "react-native-modal";
import { deleteUser } from "../utils/actions/userActions";
import { getAuth, deleteUser as deleteFirebaseUser } from "firebase/auth";

const SettingsScreen = (props) => {
  const dispatch = useDispatch();

  const auth = getAuth();

  // console.log(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const userData = useSelector((state) => state.auth.userData);
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages ?? {}
  );

  const sortedStarredMessages = useMemo(() => {
    let result = [];

    const chats = Object.values(starredMessages);

    chats.forEach((chat) => {
      const chatMessages = Object.values(chat);
      result = result.concat(chatMessages);
    });

    return result;
  }, [starredMessages]);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const email = userData.email || "";
  const about = userData.about || "";

  const initialState = {
    inputValues: {
      firstName,
      lastName,
      email,
      about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

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
      await updateSignedInUserData(userData.uid, updatedValues);
      dispatch(updateLoggedInUserData({ newData: updatedValues }));

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;

    return (
      currentValues.firstName != firstName ||
      currentValues.lastName != lastName ||
      currentValues.email != email ||
      currentValues.about != about
    );
  };
  const handleDeleteAndLogout = async () => {
    setIsLoading(true);
    try {
      // Delete user data from Firebase Realtime Database
      await deleteUser(userData.uid);
      // Delete user from Firebase Authentication
      await deleteFirebaseUser(auth.currentUser);
      // Dispatch userLogout action
      dispatch(userLogout(userData));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        className={`w-full flex-row items-center justify-between ${
          Platform.OS === "android" ? "py-6" : undefined
        } px-4`}
      >
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={32} color={"#555"} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Entypo name="dots-three-vertical" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      {/* profile */}
      <View className="items-center justify-center">
        <View className="relative border-2 border-primary p-1 rounded-full">
          <ProfileImage
            size={80}
            uid={userData.uid}
            uri={userData.photo_url}
            showEditButton={true}
          />
        </View>
      </View>

      <View className="w-full px-4">
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Input
            id="firstName"
            label="First name"
            icon="user-o"
            iconPack={FontAwesome}
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["firstName"]}
            initialValue={userData.firstName}
          />

          <Input
            id="lastName"
            label="Last name"
            icon="user-o"
            iconPack={FontAwesome}
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["lastName"]}
            initialValue={userData.lastName}
          />

          <Input
            id="email"
            label="Email"
            icon="mail"
            iconPack={Feather}
            onInputChanged={inputChangedHandler}
            keyboardType="email-address"
            autoCapitalize="none"
            errorText={formState.inputValidities["email"]}
            initialValue={userData.email}
          />

          <Input
            id="about"
            label="About"
            icon="user-o"
            iconPack={FontAwesome}
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["about"]}
            initialValue={userData.about}
          />

          <View style={{ marginTop: 20 }}>
            {showSuccessMessage && <Text>Saved!</Text>}

            {isLoading ? (
              <ActivityIndicator
                size={"small"}
                color={colors.primary}
                style={{ marginTop: 10 }}
              />
            ) : (
              hasChanges() && (
                // <SubmitButton
                //   title="Save"
                //   onPress={saveHandler}
                //   style={{ marginTop: 20 }}
                //   disabled={!formState.formIsValid}
                // />

                <TouchableOpacity
                  onPress={saveHandler}
                  style={{ marginTop: 20 }}
                  className="w-full px-4 py-2 bg-primary rounded-xl my-3 flex items-center justify-center"
                >
                  <Text className="py-2 text-white text-xl font-semibold">
                    Save
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <DataItem
            type={"link"}
            title="Starred messages"
            hideImage={true}
            onPress={() =>
              props.navigation.navigate("DataList", {
                title: "Starred messages",
                data: sortedStarredMessages,
                type: "messages",
              })
            }
          />

          {/* <SubmitButton
          title="Logout"
          onPress={() => dispatch(userLogout(userData))}
          
          color={colors.red}
        /> */}

          <TouchableOpacity
            onPress={() => dispatch(userLogout(userData))}
            style={{ marginTop: 20, backgroundColor: colors.red }}
            className="w-full px-4 py-2 rounded-xl my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleModal}
            style={{ marginTop: 20 }}
            className="w-full px-4 py-2 rounded-xl my-3 flex items-center justify-center"
          >
            <Text
              className="py-2  text-white text-xl font-semibold"
              style={{ color: colors.lightGrey }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Delete account modal */}
        <Modal
          isVisible={isModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalHeading}>
              {"Confirm Account Deletion"}
            </Text>
            <Text style={styles.modalText}>
              {
                "Are you sure you want to delete your account? This action cannot be undone."
              }
            </Text>

            <View style={styles.modalButtonsWrapper}>
              <TouchableOpacity onPress={toggleModal} style={styles.hideButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAndLogout}
                style={styles.deleteButton}
              >
                <Text style={styles.buttonText}>Confirm Deletion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    alignItems: "center",
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    // textAlign: "center",
  },
  modalButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  hideButton: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    backgroundColor: "#b0b0b0",
  },

  subText: {
    color: "#b0b0b0",
    fontSize: 14,
  },

  sheetButtonText: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  deleteButton: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    backgroundColor: colors.red,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default SettingsScreen;
