import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import styles from "./Styles";
import { useToast } from "react-native-toast-notifications";
import { useDispatch, useSelector } from "react-redux";
import { RepliesList } from "../../components/RepliesList/RepliesCard";

import { loveFeed, unloveFeed } from "../../store/feedsSlice";
import { Keyboard } from "react-native";

const FeedDetailScreen = ({ route, navigation }) => {
  // console.log("ROUTE:: ", route.params);
  const toast = useToast();
  const userData = useSelector((state) => state.auth.userData);

  console.log("User: ", userData);

  const { feed } = route.params;
  const { content } = route.params;

  const { id } = feed;

  const isFocused = useIsFocused();

  const dispatch = useDispatch();

  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [heartsCount, setHeartsCount] = useState(feed.hearts_count);

  const sendReplyHandler = async () => {
    if (!reply.trim()) {
      toast.show("Cannot be empty", {
        type: "danger",
        placement: "bottom",
        duration: 3000,
        offset: 30,
        animationType: "slide-in",
      });

      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `https://admin.pandatv.co.za/api/feeds/${id}/save/reply`,
        {
          content: reply,
          firebase_uid: userData.uid,
        }
      );

      const newReply = {
        id: response.data.id,
        content: reply,
        created_at: new Date().toISOString(),
        user: { ...response.data.user },
      };

      setReplies((currentReplies) => [newReply, ...currentReplies]);
      setReply("");
      // Dismiss the keyboard
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error sending reply:", error);
      Alert.alert("Error", "Error sending reply. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLove = (id) => {
    dispatch(loveFeed({ id, userData }));
    // dispatch(fetchFeeds());
  };

  const handleUnlove = (id) => {
    dispatch(unloveFeed({ id, userData }));
    // dispatch(fetchFeeds());
  };

  useEffect(() => {
    if (isFocused) retrieveReply();

    setHeartsCount(feed.hearts_count);
  }, [isFocused]);

  const retrieveReply = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://admin.pandatv.co.za/api/feeds/${id}/replies`
      );

      setReplies(response.data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const keyboardDismissHandler = () =>  {
    Keyboard.dismiss();
  }

  return (
    <React.Fragment>
      <View className="flex-1">
        <View className="w-full bg-primary  px-4 py-6 flex-[0.25]">
          <View className="flex-row items-center w-full px-4 py-12">
            {/* go back */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> PandaTV Community </Text>
          </View>
        </View>
        <Pressable className="w-full bg-white py-6 rounded-t-[50px] flex-1 -mt-10" onPress={keyboardDismissHandler}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View className="px-4" style={styles.tweetHeader}>
            <Image source={{ uri: feed.user.avatar }} style={styles.avatar} />

            <View style={styles.headerContent}>
              <Text
                style={styles.name}
              >{`${feed.user.first_name} ${feed.user.last_name}`}</Text>
              <Text style={styles.username}>@{feed.user.email}</Text>
            </View>
          </View>

          <View className="px-4">
            <Text style={styles.content}>{feed.content}</Text>

            {feed.image && (
              <Image
                source={{
                  uri: `https://admin.pandatv.co.za/storage/${feed?.image}`,
                }}
                style={styles.tweetImage}
              />
            )}

            <View style={styles.interactions}>
              <View style={styles.interactionIcon}>
                <FontAwesome5 name="comment-alt" size={18} color="#b0b0b0" />
                <Text style={styles.replyText}>{feed.replies_count}</Text>
              </View>
              <View style={styles.interactionIcon}>
                <TouchableOpacity
                  onPress={() =>
                    feed.lovedByUser ? handleUnlove(id) : handleLove(id)
                  }
                >
                  <Ionicons
                    name={feed.lovedByUser ? "heart" : "heart-outline"}
                    size={18}
                    color={feed.lovedByUser ? "#f45008" : "#b0b0b0"}
                  />
                </TouchableOpacity>
                <Text style={styles.replyText}>{feed.loves_count}</Text>
              </View>
            </View>
          </View>

          {/* Tweet reply form */}
          <View style={styles.tweetForm} className="px-4">
            <TextInput
              style={styles.input}
              placeholder="Reply to feed..."
              value={content ? feed.content : reply}
              onChangeText={setReply}
              multiline
            />
            <TouchableOpacity
              style={styles.tweetButton}
              onPress={sendReplyHandler}
            >
              <Text style={styles.tweetButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Replies section */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#f45008" />
            ) : (
              <View style={styles.repliesContainer}>
                <FlatList
                  data={replies}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RepliesList replies={item} navigation={navigation} />
                  )}
                />
              </View>
            )}
          </KeyboardAvoidingView>
      
        </Pressable>
      </View>
    </React.Fragment>
  );
};

export default FeedDetailScreen;
