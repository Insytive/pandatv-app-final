import {
  child,
  endAt,
  get,
  getDatabase,
  orderByChild,
  push,
  query,
  ref,
  remove,
  startAt,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const getUserData = async (uid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${uid}`);

    const snapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.log(error);
  }
};

export const getUserChats = async (uid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `userChats/${uid}`);

    const snapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.log(error);
  }
};

export const deleteUserChat = async (uid, key) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `userChats/${uid}/${key}`);

    await remove(chatRef);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addUserChat = async (uid, chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `userChats/${uid}`);

    await push(chatRef, chatId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (uid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${uid}`);

    await remove(userRef);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const searchUsers = async (queryText) => {
  const searchTerm = queryText.toLowerCase();

  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, "users");

    const queryRef = query(
      userRef,
      orderByChild("username"),
      startAt(searchTerm),
      endAt(searchTerm + "\uf8ff")
    );

    const snapshot = await get(queryRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  } catch (error) {
    console.log(error);
    throw error;
  }
};
