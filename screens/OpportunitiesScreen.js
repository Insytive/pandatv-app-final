import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import OpportunityCard from "../components/OpportunityCard";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";

const OpportunitiesScreen = ({ children }) => {
  const [opportunities, setOpportunities] = useState([]);
  const userData = useSelector((state) => state.auth.userData);

  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("internal");
  const [internalOpportunities, setInternalOpportunities] = useState([]);
  const [externalOpportunities, setExternalOpportunities] = useState([]);

  useEffect(() => {
    setLoading(true);
    const apiUrl = "https://admin.pandatv.co.za/api/opportunities";

    axios
      .get(apiUrl)
      .then((response) => {
        setOpportunities(response.data.data.external);
      })
      .catch((error) => {
        console.error("Error fetching opportunities:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOpportunities("internal");
    fetchOpportunities("external");
  }, []);

  const fetchOpportunities = (type) => {
    setLoading(true);
    const apiUrl = `https://admin.pandatv.co.za/api/opportunities/${type}`;

    axios
      .get(apiUrl)
      .then((response) => {
        if (type === "internal") {
          setInternalOpportunities(response.data.data);
        } else {
          setExternalOpportunities(response.data.data);
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${type} opportunities:`, error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderOpportunities = (opportunities) => {
    return opportunities
      .slice(0, 12)
      .map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={"#f45008"} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="w-full bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center justify-between w-full px-4 py-12">
          {/* go back */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> Opportunities </Text>
          </View>

          {/* user profile */}
          <View className="flex-row items-center justify-center space-x-3">
            <Image
              source={{ uri: userData?.photo_url }}
              className="w-12 h-12"
              resizeMode="contain"
              style={{ height: 30, width: 30, borderRadius: 15 }}
            />
          </View>
        </View>
      </View>

      {/* bottom section */}
      <View style={styles.container}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "internal" && styles.activeTab]}
            onPress={() => setActiveTab("internal")}
          >
            <Text style={styles.tabHeading}>Internal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "external" && styles.activeTab]}
            onPress={() => setActiveTab("external")}
          >
            <Text style={styles.tabHeading}>External</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size={"small"} color={"#f45008"} />
          ) : activeTab === "internal" ? (
            renderOpportunities(internalOpportunities)
          ) : (
            renderOpportunities(externalOpportunities)
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabHeading: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
});

export default OpportunitiesScreen;
