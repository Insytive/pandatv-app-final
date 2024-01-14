import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

const LocalOpportunityScreen = ({ route }) => {
  const [document, setDocument] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const [isReady, setIsReady] = useState(false);

  const user = useSelector((state) => state.auth.userData);

  const { uid } = user;
  // Destruction opportunity id
  const { id } = route.params.opportunity;

  const { opportunity } = route.params;
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const baseApiUrl = "https://admin.pandatv.co.za/api";

  const uploadDocument = async (pickedDocument) => {
    setIsLoading(true);

    const formData = new FormData();
    if (pickedDocument) {
      const uri =
        Platform.OS === "android"
          ? pickedDocument.uri
          : pickedDocument.uri.replace("file://", "");
      const filename = pickedDocument.uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : undefined;

      let type;
      switch (ext) {
        case "pdf":
          type = "application/pdf";
          break;
        case "doc":
        case "docx":
          type = "application/msword";
          break;
        case "txt":
          type = "text/plain";
          break;

        default:
          type = "application/octet-stream";
      }

      formData.append("resume", {
        uri,
        name: filename,
        type,
      });
    }

    try {
      const response = await axios.post(
        `${baseApiUrl}/user/upload/resume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("response", response.data);
      setFileUrl(response.data.data);

      // Save application
      saveUserData(response.data.url);
    } catch (error) {
      if (error.response) {
        console.log("Response error:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error setting up the request:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (filePath) => {
    const url = `${baseApiUrl}/user/${uid}/resume/save`;
    const method = "post";

    try {
      const response = await axios({
        url,
        method,
        data: {
          resume: filePath,
          firebase_uid: uid,
        },
      });

      const { success } = response.data;
      // console.log(response.data.success);
      if (success) {
        Alert.alert("Success", "Document Uploaded Successfully");
        setFileUrl("");
        setDocument(null);
        setIsReady(true);
      }
    } catch (error) {
      console.log(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocumentHandler = useCallback(async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({});
      if (result) {
        // Set the document state
        const pickedDocument = result?.assets[0];
        setDocument(pickedDocument);

        // Call uploadDocument with the picked document
        await uploadDocument(pickedDocument);

        console.log("Get here...", fileUrl);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const submitApplication = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${baseApiUrl}/opportunities/${id}/apply`,
        {
          firebase_uid: uid,
        }
      );
      console.log("response", response.data);

      setIsReady(false);
      Alert.alert("Complete", "Application successfully submitted.");
    } catch (error) {
      if (error.response) {
        Alert.alert("Application Error", error.response.data.message);
        console.log("Response error:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error setting up the request:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View className="w-full bg-primary px-4 flex-[0.25]">
        <View className="flex-row items-center space-between  w-full px-4 py-12">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> {opportunity?.title} </Text>
          </View>

          {/* user profile */}
          {/* <View className="flex-row items-center justify-center space-x-3">
            <Image
              source={{ uri: user?.photo_url }}
              className="w-12 h-12"
              resizeMode="contain"
              style={{ height: 30, width: 30, borderRadius: 15 }}
            />
          </View> */}
        </View>
      </View>

      <View className="w-full bg-white px-4 py-6  flex-1 -mt-10">
        {/* <WebView source={{ uri: url }} /> */}
        <ScrollView style={styles.container}>
          <Image source={{ uri: opportunity.image }} style={styles.image} />
          <View style={styles.content}>
            <Text style={styles.title}>{opportunity.title}</Text>
            <View style={styles.info}>
              <Text style={styles.infoText}>
                Posted on: {opportunity.created_at}
              </Text>
              <Text style={styles.infoText}>
                Expiry Date: {opportunity.expiry_date}
              </Text>
              <Text style={styles.infoText}>
                Type: {opportunity.types[0].name}
              </Text>
            </View>
            <Text style={styles.description}>{opportunity.description}</Text>

            {isLoading && (
              <ActivityIndicator size={"small"} color={"#f45008"} />
            )}

            {!isReady ? (
              <TouchableOpacity
                style={styles.button}
                onPress={pickDocumentHandler}
              >
                <View style={styles.buttonContent}>
                  <FontAwesome name="cloud-upload" size={20} color="white" />
                  <Text style={styles.buttonText}>Upload Resume</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={submitApplication}
              >
                <View style={styles.buttonContent}>
                  {/* <FontAwesome name="cloud-upload" size={20} color="white" /> */}
                  <Text style={styles.buttonText}>Submit Application</Text>
                </View>
              </TouchableOpacity>
            )}

            {document && <Text>Upload document: {document?.name}</Text>}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee9ce",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#303d4d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default LocalOpportunityScreen;
