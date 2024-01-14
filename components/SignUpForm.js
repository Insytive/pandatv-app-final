import React, { useCallback, useEffect, useReducer, useState } from "react";
import Input from "../components/Input";
import SubmitButton from "../components/SubmitButton";
import { Feather, FontAwesome } from "@expo/vector-icons";

import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import { signUp } from "../utils/actions/authActions";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";
import { useDispatch } from "react-redux";
import Checkbox from "expo-checkbox";

import Modal from "react-native-modal";
import EulaConsent from "./EulaConsent";

const initialState = {
  inputValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  },
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },
  formIsValid: false,
};

const SignUpForm = (props) => {
  const dispatch = useDispatch();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [isModalVisible, setModalVisible] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    if (!termsAccepted) {
      Alert.alert(
        "End User License Agreement (EULA)",
        "Please accept Panda TV Chat Feature End User License Agreement (EULA) to proceed."
      );
      return;
    }
    try {
      setIsLoading(true);

      const action = signUp(
        formState.inputValues.firstName,
        formState.inputValues.lastName,
        formState.inputValues.email,
        formState.inputValues.password
      );
      setError(null);
      await dispatch(action);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [dispatch, formState, termsAccepted]);

  return (
    <ScrollView className="w-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "height" : undefined}
        keyboardVerticalOffset={100}
      >
        <Input
          id="firstName"
          label="First name"
          icon="user-o"
          iconPack={FontAwesome}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["firstName"]}
        />

        <Input
          id="lastName"
          label="Last name"
          icon="user-o"
          iconPack={FontAwesome}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["lastName"]}
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
        />

        <Input
          id="password"
          label="Password"
          icon="lock"
          autoCapitalize="none"
          secureTextEntry
          iconPack={Feather}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["password"]}
        />

        {/* Terms and Conditions checkbox */}
        <View style={styles.termsContainer}>
          <Checkbox
            value={termsAccepted}
            onValueChange={setTermsAccepted}
            color={termsAccepted ? colors.primary : undefined}
          />
          <Text style={styles.termsText}>I agree to the</Text>
          <Pressable onPress={toggleModal}>
            <Text style={styles.termsTextLink}>EULA</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size={"small"}
            color={colors.primary}
            style={{ marginTop: 10 }}
          />
        ) : (
          <TouchableOpacity
            onPress={authHandler}
            style={{ marginTop: 20 }}
            className="w-full px-4 py-2 rounded-xl bg-primary my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>

      <Modal isVisible={isModalVisible} animationType="fade" transparent={true}>
        <EulaConsent onClose={toggleModal} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
  },
  termsText: {
    marginLeft: 8,
  },

  termsTextLink: {
    color: colors.primary,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default SignUpForm;
