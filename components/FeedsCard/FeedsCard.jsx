import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import styles from "./Styles";
import { useSelector } from "react-redux";

const FeedsCard = ({
  feeds,
  navigation,
  likedByUser,
  onHeartPress,
  onOptionsPress,
  onSelect,
}) => {
  const isFocused = useIsFocused();

  return (
    <TouchableOpacity
      style={styles.tweetContainer}
      onPress={() =>
        navigation.navigate("FeedDetail", {
          feed: feeds,
          isLikedByUser: likedByUser,
        })
      }
    >
      <View style={styles.tweetContainer}>
        <Image source={{ uri: feeds.user.avatar }} style={styles.avatar} />

        <View style={styles.tweetContent}>
          <View style={styles.tweetHeader}>
            <View style={styles.headerContent}>
              <Text
                style={styles.name}
              >{`${feeds.user.first_name} ${feeds.user.last_name}`}</Text>
              <Text style={styles.username}>@{feeds.user.email}</Text>
            </View>
            <TouchableOpacity onPress={onOptionsPress}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#b0b0b0" />
            </TouchableOpacity>
          </View>
          <Text>{feeds.content}</Text>
          {feeds.image && (
            <Image
              source={{
                uri: `https://admin.pandatv.co.za/storage/${feeds?.image}`,
              }}
              style={styles.tweetImage}
            />
          )}
          <View style={styles.interactions}>
            <View style={styles.interactionIcon}>
              {/* <Ionicons name="chatbubble-outline" size={18} color="#b0b0b0" /> */}
              <FontAwesome5 name="comment-alt" size={18} color="#b0b0b0" />
              <Text style={styles.replyText}>{feeds.replies_count}</Text>
            </View>
            {/* <View style={styles.interactionIcon}>
              <Ionicons name="repeat-outline" size={18} color="#b0b0b0" />
              <Text>{feeds.reposts_count}</Text>
            </View> */}
            <View style={styles.interactionIcon}>
              <TouchableOpacity onPress={onHeartPress}>
                <Ionicons
                  name={feeds.lovedByUser ? "heart" : "heart-outline"}
                  size={18}
                  color={feeds.lovedByUser ? "#f45008" : "#b0b0b0"}
                />
              </TouchableOpacity>
              <Text style={styles.replyText}>{feeds.loves_count}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeedsCard;
