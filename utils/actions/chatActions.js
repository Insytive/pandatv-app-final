import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import { getUserPushTokens } from "./authActions";
import { addUserChat, deleteUserChat, getUserChats } from "./userActions";

export const blockUser = async (blockerUid, blockedUid) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const blockListRef = child(dbRef, `userBlockList/${blockerUid}`);

  // Add the blocked user's UID to the blocker's blocklist
  await set(child(blockListRef, blockedUid), true);
};

export const unblockUser = async (blockerUid, blockedUid) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const blockListRef = child(dbRef, `userBlockList/${blockerUid}`);

  // Remove the blocked user's UID from the blocker's blocklist
  await remove(child(blockListRef, blockedUid));
};

export const createChat = async (loggedInuid, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInuid,
    updatedBy: loggedInuid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const newChat = await push(child(dbRef, "chats"), newChatData);

  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const uid = chatUsers[i];
    await push(child(dbRef, `userChats/${uid}`), newChat.key);
  }

  return newChat.key;
};

export const isUserBlocked = async (senderData, chatUsers) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  // Check if the sender is blocked by any of the recipients
  const blockChecks = chatUsers.map(async (uid) => {
    if (uid !== senderData.uid) {
      const blockListRef = child(
        dbRef,
        `userBlockList/${uid}/${senderData.uid}`
      );
      const snapshot = await get(blockListRef);
      return snapshot.exists();
    }
    return false;
  });

  const isBlocked = (await Promise.all(blockChecks)).some((blocked) => blocked);

  return isBlocked;
};

export const sendTextMessage = async (
  chatId,
  senderData,
  messageText,
  replyTo,
  chatUsers
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const blockChecks = chatUsers.map(async (uid) => {
    if (uid !== senderData.uid) {
      const blockListRef = child(
        dbRef,
        `userBlockList/${uid}/${senderData.uid}`
      );
      const snapshot = await get(blockListRef);
      return snapshot.exists();
    }
    return false;
  });

  const isBlocked = (await Promise.all(blockChecks)).some((blocked) => blocked);

  if (isBlocked) {
    // console.log(`Message not sent. Sender is blocked.`);
    // return;
    return { blocked: true };
  }

  await sendMessage(chatId, senderData.uid, messageText, null, replyTo, null);

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.uid);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    messageText,
    chatId
  );
};

export const sendInfoMessage = async (chatId, senderId, messageText) => {
  await sendMessage(chatId, senderId, messageText, null, null, "info");
};

export const sendImage = async (
  chatId,
  senderData,
  imageUrl,
  replyTo,
  chatUsers
) => {
  await sendMessage(chatId, senderData.uid, "Image", imageUrl, replyTo, null);

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.uid);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} sent an image`,
    chatId
  );
};

export const updateChatData = async (chatId, uid, chatData) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${chatId}`);

  await update(chatRef, {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: uid,
  });
};

const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  replyTo,
  type
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  if (type) {
    messageData.type = type;
  }

  await push(messagesRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const starMessage = async (messageId, chatId, uid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${uid}/${chatId}/${messageId}`
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      // Starred item exists - Un-star
      await remove(childRef);
    } else {
      // Starred item does not exist - star
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };

      await set(childRef, starredMessageData);
    }
  } catch (error) {
    console.log(error);
  }
};

export const removeUserFromChat = async (
  userLoggedInData,
  userToRemoveData,
  chatData
) => {
  const userToRemoveId = userToRemoveData.uid;
  const newUsers = chatData.users.filter((uid) => uid !== userToRemoveId);
  await updateChatData(chatData.key, userLoggedInData.uid, { users: newUsers });

  const userChats = await getUserChats(userToRemoveId);

  for (const key in userChats) {
    const currentChatId = userChats[key];

    if (currentChatId === chatData.key) {
      await deleteUserChat(userToRemoveId, key);
      break;
    }
  }

  const messageText =
    userLoggedInData.uid === userToRemoveData.uid
      ? `${userLoggedInData.firstName} left the chat`
      : `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

  await sendInfoMessage(chatData.key, userLoggedInData.uid, messageText);
};

export const addUsersToChat = async (
  userLoggedInData,
  usersToAddData,
  chatData
) => {
  const existingUsers = Object.values(chatData.users);
  const newUsers = [];

  let userAddedName = "";

  usersToAddData.forEach(async (userToAdd) => {
    const userToAddId = userToAdd.uid;

    if (existingUsers.includes(userToAddId)) return;

    newUsers.push(userToAddId);

    await addUserChat(userToAddId, chatData.key);

    userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
  });

  if (newUsers.length === 0) {
    return;
  }

  await updateChatData(chatData.key, userLoggedInData.uid, {
    users: existingUsers.concat(newUsers),
  });

  const moreUsersMessage =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : "";
  const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessage}to the chat`;
  await sendInfoMessage(chatData.key, userLoggedInData.uid, messageText);
};

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
  chatUsers.forEach(async (uid) => {
    console.log("test");
    const tokens = await getUserPushTokens(uid);

    for (const key in tokens) {
      const token = tokens[key];

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          title,
          body,
          data: { chatId },
        }),
      });
    }
  });
};
