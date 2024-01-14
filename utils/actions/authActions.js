import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { getFirebaseApp } from "../firebaseHelper";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { child, get, getDatabase, ref, set, update } from "firebase/database";
import { authenticate, logout } from "../../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "./userActions";
import axios from "axios";

let timer;

export const signUp = (firstName, lastName, email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate - timeNow;

      const userData = await createUser(firstName, lastName, email, uid);

      dispatch(authenticate({ token: accessToken, userData }));
      storeUserToDatabase(uid, firstName, lastName, email, password);

      saveDataToStorage(accessToken, uid, expiryDate);

      await storePushToken(userData);

      timer = setTimeout(() => {
        dispatch(userLogout(userData));
      }, millisecondsUntilExpiry);
    } catch (error) {
      console.log(error);
      const errorCode = error.code;

      let message = "Something went wrong.";

      if (errorCode === "auth/email-already-in-use") {
        message = "This email is already in use";
      }

      throw new Error(message);
    }
  };
};

export const signIn = (email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate - timeNow;

      const userData = await getUserData(uid);

      dispatch(authenticate({ token: accessToken, userData }));
      saveDataToStorage(accessToken, uid, expiryDate);
      await storePushToken(userData);

      timer = setTimeout(() => {
        dispatch(userLogout(userData));
      }, millisecondsUntilExpiry);
    } catch (error) {
      const errorCode = error.code;

      let message = "Something went wrong.";

      if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/user-not-found"
      ) {
        message = "The username or password was incorrect";
      }

      throw new Error(message);
    }
  };
};

export const userLogout = (userData) => {
  return async (dispatch) => {
    try {
      await removePushToken(userData);
    } catch (error) {
      console.log(error);
    }

    AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const updateSignedInUserData = async (uid, newData) => {
  if (newData.firstName && newData.lastName) {
    const username = `${newData.firstName} ${newData.lastName}`.toLowerCase();
    newData.username = username;
  }

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${uid}`);
  await update(childRef, newData);
};

const createUser = async (firstName, lastName, email, uid) => {
  const username = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    firstName,
    lastName,
    username,
    email,
    uid,
    signUpDate: new Date().toISOString(),
  };

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${uid}`);
  await set(childRef, userData);
  return userData;
};

const saveDataToStorage = (token, uid, expiryDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token,
      uid,
      expiryDate: expiryDate.toISOString(),
    })
  );
};

const storePushToken = async (userData) => {
  if (!Device.isDevice) {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const tokenData = { ...userData.pushTokens } || {};
  const tokenArray = Object.values(tokenData);

  if (tokenArray.includes(token)) {
    return;
  }

  tokenArray.push(token);

  for (let i = 0; i < tokenArray.length; i++) {
    const tok = tokenArray[i];
    tokenData[i] = tok;
  }

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const userRef = child(dbRef, `users/${userData.uid}/pushTokens`);

  await set(userRef, tokenData);
};

const removePushToken = async (userData) => {
  if (!Device.isDevice) {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const tokenData = await getUserPushTokens(userData.uid);

  for (const key in tokenData) {
    if (tokenData[key] === token) {
      delete tokenData[key];
      break;
    }
  }

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const userRef = child(dbRef, `users/${userData.uid}/pushTokens`);

  await set(userRef, tokenData);
};

export const getUserPushTokens = async (uid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${uid}/pushTokens`);

    const snapshot = await get(userRef);

    if (!snapshot || !snapshot.exists()) {
      return {};
    }

    return snapshot.val() || {};
  } catch (error) {
    console.log(error);
  }
};

// Store user to the laravel database
const storeUserToDatabase = async (
  uid,
  firstName,
  lastName,
  email,
  password
) => {
  try {
    const response = await axios.post(
      `https://admin.pandatv.co.za/api/auth/register`,
      {
        firebase_uid: uid,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        password_confirmation: password,
      },
      {
        headers: {
          "X-API-Key": "TXGbCCNPSSp8DXhmOzrvmHnWvluqA2wo",
        },
      }
    );

    console.log("User stored to Laravel:", response.data);
  } catch (error) {
    console.log("Could not store user on Laravel: ", error);
    // Check if error response is available
    if (error.response) {
      console.log(
        "Error Saving user to Laravel Server:: ",
        error.response.data
      );
    }
  }
};
