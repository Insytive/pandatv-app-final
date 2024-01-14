import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

export const Styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 25,
    bottom: 55,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },

  buttonText: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: "500",
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
