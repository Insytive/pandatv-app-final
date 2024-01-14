import { Entypo } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { timeElapsedSince } from "../../utils/helpers";
import { useSelector } from "react-redux";

export const RepliesList = ({ replies }) => {
  return (
    <View key={replies.id}>
      <View className="px-8 py-3" style={styles.replies}>
        {/* Profile Picture */}
        <Image
          source={{ uri: replies.user?.avatar }}
          style={styles.profilePic}
        />
        {/* Reply Content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            {/* Username and Time */}
            <Text style={styles.userName}>
              {replies.user.first_name + " " + replies.user.last_name}
            </Text>
            <Text style={styles.userHandle}>(@{replies.user.first_name})</Text>
          </View>

          {/* Reply Content */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <Text style={styles.replyContent}>{replies.content}</Text>
              <Text style={styles.timeElapsed}>
                <Entypo name="dot-single" size={18} color="black" />
                {timeElapsedSince(replies.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  replies: {
    flexDirection: "row",
    // alignItems: "",
    // margin: 10,
    // paddingVertical: 10,
    borderTopColor: "#e0e0e0",
    borderTopWidth: 1,
    width: "100%",
  },

  replyContent: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingTop: 4,
  },
  userName: {
    fontWeight: "600",
  },
  userHandle: {
    color: "#555",
  },
  timeElapsed: {
    color: "#aaa",
    fontSize: 14,
    paddingTop: 10,
  },
});
