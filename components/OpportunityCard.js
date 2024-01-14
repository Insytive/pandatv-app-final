import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";

const OpportunityCard = ({ opportunity }) => {
  const { title, image, created_at, types, link } = opportunity;
  const navigation = useNavigation();

  const handlePress = () => {
    if (link) {
      // Open a WebView for external opportunities with a link
      navigation.navigate("JobApplication", { url: link, title: title });
    } else {
      // Navigate to a local screen for internal opportunities or external without a link
      navigation.navigate("LocalOpportunity", { opportunity });
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.card}>
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          style={styles.opportunityImage}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.category}>
          Posted in {types.length > 0 ? types[0].name : "N/A"}
        </Text>
        <Text style={styles.timePosted}>{created_at}</Text>

        <TouchableOpacity style={styles.applyButton} onPress={handlePress}>
          <Text style={styles.applyButtonText}>View Job</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    shadowColor: "#383838",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
    padding: 16,
    margin: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  showAll: {
    color: "#f45008",
  },
  opportunityImage: {
    width: "100%",
    height: 220,
    borderRadius: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  category: {
    color: "gray",
  },
  timePosted: {
    color: "gray",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginTop: 8,
  },
  priceDetail: {
    color: "gray",
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // alignSelf: "center",
    marginTop: 16,
  },
  applyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OpportunityCard;
