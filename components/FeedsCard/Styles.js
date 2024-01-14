import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  tweetContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tweetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 50,
  },

  tweetContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tweetContent: {
    flex: 1,
  },

  draggableContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    height: "40%", // Change this as needed
    // Add your styles for shadow, borders etc.
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  tweetContent: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
  },
  username: {
    color: "#b0b0b0",
  },
  tweetImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  replyText: {
    paddingLeft: 5,
  },
  interactions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  interactionIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default styles;
