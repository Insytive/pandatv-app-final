import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Button,
} from "react-native";
import { MaterialIcons, Ionicons, Entypo } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "react-native-toast-notifications";

import * as ImagePicker from "expo-image-picker";
import { ProgressBar } from "../../components/ProgressBar";
import { Thumbnail } from "../../components/Thumbnail";

const baseApiUrl = "https://admin.pandatv.co.za/api";

const EditFeedScreen = ({ navigation, route }) => {
  const { feed, editing, id } = route.params;
  const [feedContent, setFeedContent] = useState(feed.content);
  // const [imageUri, setImageUri] = useState("");
  const userData = useSelector((state) => state.auth.userData);

  const [selectedImage, setSelectedImage] = useState();

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const CustomToastContent = ({ onButtonPress }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 10,
      }}
    >
      {/* <Image
        source={LogoIcon}
        style={{ height: 30, width: 30, marginRight: 10 }}
      /> */}
      <Text style={{ color: "#fff" }}>Your Edit was saved! </Text>
    </View>
  );

  const feedPostHandler = async () => {
    setIsLoading(true);

    const url = `${baseApiUrl}/feeds/${feed?.id}/update`;
    const method = "patch";

    try {
      const response = await axios({
        url,
        method,
        data: {
          firebase_uid: userData.uid,
          content: feedContent,
          image: "",
        },
      });

      toast.show("", {
        type: "custom",
        placement: "bottom",
        offset: 30,
        animationType: "slide-in",
        renderToast: ({ hide }) => (
          <CustomToastContent
            onButtonPress={() => {
              hide();
            }}
          />
        ),
      });

      navigation.goBack();

      console.log(response.data);
      setFeedContent("");
    } catch (error) {
      // toast.show("Error posting data", {
      //   type: "danger",
      //   placement: "bottom",
      //   duration: 3000,
      //   offset: 30,
      //   animationType: "slide-in",
      // });

      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openImagePickerAsync = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!pickerResult.cancelled) {
      console.log(pickerResult);
      // setSelectedImage(pickerResult);
    }
  };

  const MAX_LENGTH = 280;

  return (
    <View className="flex-1">
      {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
      <View className="w-full bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center  w-full px-4 py-12">
          {/* go back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
          </TouchableOpacity>

          <Text className="font-bold text-white"> Create feed</Text>
        </View>
      </View>

      <View className="w-full px-4  bg-white py-6 rounded-t-[50px] flex-1 -mt-10">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={100}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.postButton}
              onPress={feedPostHandler}
            >
              <Text style={styles.postButtonText}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  " Post"
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.composeContainer}>
            <Image
              source={{ uri: userData?.photo_url }}
              style={styles.avatar}
            />

            <TextInput
              style={styles.input}
              placeholder="Share your thoughts..."
              multiline
              value={feedContent}
              onChangeText={setFeedContent}
              maxLength={MAX_LENGTH}
            />
          </View>

          {/* {selectedImage ? (
            <>
              <Thumbnail uri={selectedImage.uri} />
            </>
          ) : (
            <TouchableOpacity
              onPress={openImagePickerAsync}
              text="Pick a photo"
            />
          )} */}
          <StatusBar style="auto" />

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openImagePickerAsync}
            >
              <Entypo name="image" size={24} color="#f45008" />
            </TouchableOpacity>

            <ProgressBar
              value={feedContent.length}
              maxValue={MAX_LENGTH}
              size={24}
              strokeWidth={3}
            />
          </View>
          <View style={styles.counterWrapper}>
            <Text style={styles.counter}>
              {MAX_LENGTH - feedContent.length}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // padding: 16,
    paddingBottom: 16,
    paddingTop: 10,
  },
  composeContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 10,
    margin: 10,
    textAlignVertical: "top",
    borderRadius: 20,
  },
  postButton: {
    backgroundColor: "#f45008",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    // padding: 16,
  },
  iconButton: {},
  counter: {
    fontSize: 12,
    color: "#555",
    fontWeight: "400",
  },

  counterWrapper: {
    alignItems: "flex-end",
  },
});

export default EditFeedScreen;
