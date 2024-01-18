import React, { useState, useEffect, Fragment } from "react";
import {
  TouchableOpacity,
  Stylesheet,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Text,
  Pressable,
  Button,
} from "react-native";
import axios from "axios";
import { View } from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import FeedsCard from "../../components/FeedsCard/FeedsCard";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import { WINDOW_HEIGHT } from "../../utils/helpers";
import { Styles } from "./Styles";

import { useFocusEffect } from "@react-navigation/native";
import Modal from "react-native-modal";
import {
  fetchFeeds,
  loveFeed,
  unloveFeed,
  checkIfLovedByUser,
} from "../../store/feedsSlice";

import { useToast } from "react-native-toast-notifications";

// const BOTTOM_SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.6;
// const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.3;

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
    <Text style={{ color: "#fff" }}>Thank you. We're reviewing this feed.</Text>
  </View>
);

const CommunityScreen = ({ navigation }) => {
  // const [feeds, setFeeds] = useState([]);
  const { feeds, loading, error, lovedByUser } = useSelector(
    (state) => state.feeds
  );

  // const [loading, setLoading] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState({});
  const [selectedFeedFirebaseId, setSelectedFeedFirebaseId] = useState(null);
  const [selectedFeedContent, setSelectedFeedContent] = useState({});
  const [deleteContentVisible, setDeleteContentVisible] = useState(false);

  const dispatch = useDispatch();

  const toast = useToast();

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [bottomSheetMinHeight, setBottomSheetMinHeight] = useState(
    WINDOW_HEIGHT * 0
  );

  const userData = useSelector((state) => state.auth.userData);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchAndUpdateFeeds = async () => {
        await dispatch(fetchFeeds());

        // Now, for each feed, check if it's loved by the user
        feeds.forEach((feed) => {
          dispatch(checkIfLovedByUser({ id: feed.id, userData }));
        });
      };

      fetchAndUpdateFeeds();
    }
  }, [dispatch, userData, feeds.length, isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsBottomSheetVisible(false);
      };
    }, [])
  );

  const handleLove = (id) => {
    dispatch(loveFeed({ id, userData }));
    // dispatch(fetchFeeds());
  };

  const handleUnlove = (id) => {
    dispatch(unloveFeed({ id, userData }));
    // dispatch(fetchFeeds());
  };

  const opeDeleteModalHandler = () => {
    setModalVisible(true);
    setDeleteContentVisible(true);
    setIsBottomSheetVisible(!isBottomSheetVisible);
  };

  const opeReportModalHandler = () => {
    setModalVisible(true);

    setDeleteContentVisible(false);
    setIsBottomSheetVisible(!isBottomSheetVisible);
  };

  const deleteFeedHandler = async () => {
    if (selectedFeedId) {
      try {
        await axios.delete(
          `https://admin.pandatv.co.za/api/feeds/${selectedFeedId}/delete?firebase_uid=${encodeURIComponent(
            userData.uid
          )}`
        );

        await dispatch(fetchFeeds());
        // Now, for each feed, check if it's loved by the user
        feeds.forEach((feed) => {
          dispatch(checkIfLovedByUser({ id: feed.id, userData }));
        });
        // console.log(response.data);
        setIsBottomSheetVisible(false);
      } catch (error) {
        console.error("Error deleting feed:", error);
      } finally {
        setModalVisible(false);
      }
    }
  };

  const bottomSheetHandler = (id, feed) => {
    setSelectedFeedId(id);
    setSelectedFeedFirebaseId(feed.user.firebase_uid);
    setSelectedFeed(feed);
    setSelectedFeedContent(feed.content);

    setBottomSheetMinHeight(WINDOW_HEIGHT * 0);
    setIsBottomSheetVisible(!isBottomSheetVisible);
  };

  const closeSheet = () => {
    setIsBottomSheetVisible(false);
    setDeleteContentVisible(false);
  };

  const reportFeedHandler = async () => {
    try {
      const response = await axios.post(
        `https://admin.pandatv.co.za/api/feeds/${selectedFeedId}/report`,
        {
          firebase_uid: userData.uid,
          reason: "I would like to report this feed",
          feed_id: selectedFeedId,
        }
      );

      setTimeout(function () {
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
      }, 1000);

      await dispatch(fetchFeeds());
      feeds.forEach((feed) => {
        dispatch(checkIfLovedByUser({ id: feed.id, userData }));
      });
      setIsBottomSheetVisible(false);
    } catch (error) {
      console.error("Error deleting feed:", error);
    } finally {
      setModalVisible(false);
    }
  };

  const updateFeedHandler = () => {
    navigation.navigate("EditFeedScreen", {
      feed: selectedFeed,
      editing: true,
    });
  };

  const newFeedHandler = () => {
    navigation.navigate("NewFeedScreen");
  };

  return (
    <Pressable onPress={closeSheet} className="flex-1">
      <View className="w-full bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center justify-between w-full px-4 py-12">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
            </TouchableOpacity>

            <Text className="font-bold text-white"> PandaTV Community </Text>
          </View>
        </View>
      </View>

      <View className="w-full bg-white px-4 py-6 rounded-t-[50px] flex-1 -mt-10">
        {/* <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={180}
        > */}
        <>
          <View>
            {loading ? (
              <ActivityIndicator Size="small" Color="#f45008" />
            ) : (
              <FlatList
                data={feeds}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <FeedsCard
                    feeds={item}
                    navigation={navigation}
                    onSelect={() => checkUserLoved(item.id)}
                    onHeartPress={() =>
                      item.lovedByUser
                        ? handleUnlove(item.id)
                        : handleLove(item.id)
                    }
                    onOptionsPress={() => bottomSheetHandler(item.id, item)}
                  />
                )}
              />
            )}
          </View>
        </>
        {/* </KeyboardAvoidingView> */}
      </View>

      {/* Floating button */}
      <TouchableOpacity style={Styles.floatingButton} onPress={newFeedHandler}>
        <MaterialCommunityIcons
          name="comment-plus-outline"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      <Modal isVisible={isModalVisible} animationType="fade" transparent={true}>
        <View style={Styles.modalView}>
          <Text style={Styles.modalHeading}>
            {" "}
            {deleteContentVisible
              ? "Are you sure?"
              : "Do you want to report this feed?"}{" "}
          </Text>
          <Text style={Styles.modalText}>
            {deleteContentVisible
              ? "Please not process cannot be reversed."
              : null}
          </Text>

          <View style={Styles.modalButtonsWrapper}>
            <TouchableOpacity onPress={toggleModal} style={Styles.hideButton}>
              <Text style={Styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                deleteContentVisible ? deleteFeedHandler : reportFeedHandler
              }
              style={Styles.deleteButton}
            >
              <Text style={Styles.buttonText}>
                {deleteContentVisible ? "Delete" : "Report"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Draggable Bottom Sheet */}
      {isBottomSheetVisible && (
        <DraggableBottomSheet
          maxHeight={WINDOW_HEIGHT * 0.5}
          minHeight={bottomSheetMinHeight}
          closeSheet={closeSheet}
        >
          <View style={Styles.wrapper} className="px-4">
            {/* {feeds.} */}
            {selectedFeedFirebaseId === userData.uid && (
              <Fragment>
                <TouchableOpacity onPress={opeDeleteModalHandler}>
                  <View style={Styles.sheetButtonText}>
                    <Feather
                      name="delete"
                      size={24}
                      color="black"
                      style={Styles.icon}
                    />
                    <Text style={Styles.text}>Move to trash </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={updateFeedHandler}>
                  <View style={Styles.sheetButtonText}>
                    <Feather
                      name="edit"
                      size={24}
                      color="black"
                      style={Styles.icon}
                    />
                    <Text style={Styles.text}>Edit your feed </Text>
                  </View>
                </TouchableOpacity>
              </Fragment>
            )}

            {/* Not Current user's post */}

            {selectedFeedFirebaseId !== userData.uid && (
              <TouchableOpacity onPress={opeReportModalHandler}>
                <View style={Styles.sheetButtonText}>
                  <Octicons
                    name="report"
                    size={24}
                    color="black"
                    style={Styles.icon}
                  />
                  <View style={Styles.feedReport}>
                    <Text style={Styles.text}>Report feed </Text>
                    <Text style={Styles.subText}>
                      {"Let us know if the feed is harmful"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </DraggableBottomSheet>
      )}
    </Pressable>
  );
};

export default CommunityScreen;
