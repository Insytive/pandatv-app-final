import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  tweetHeader: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerContent: {
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
  },
  username: {
    color: "#b0b0b0",
  },
  content: {
    padding: 10,
    fontSize: 16,
  },
  tweetImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
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

  interactions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  interactionIcon: {
    flexDirection: "row",
    alignItems: "center",
  },

  tweetForm: {
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    // padding: 10,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  replyText: {
    paddingLeft: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
    marginVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  tweetButton: {
    backgroundColor: "#f45008",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  tweetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // repliesContainer: {
  //   padding: 10,
  //   flexDirection: "column",
  // },
});

export default styles;
