import React from "react";
import { View, Image, StyleSheet } from "react-native";

export const Thumbnail = ({ uri }) => (
  <View>
    <Image source={{ uri }} style={styles.thumbnail} />
  </View>
);

const styles = StyleSheet.create({
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 50,
  },
});
