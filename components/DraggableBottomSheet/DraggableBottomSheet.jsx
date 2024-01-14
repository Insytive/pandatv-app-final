import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DRAG_THRESHOLD = 50;
const MAX_DOWNWARD_TRANSLATE_Y = 0;

const CLOSE_THRESHOLD = -100;

const DraggableBottomSheet = ({
  children,
  maxHeight,
  minHeight,
  closeSheet,
}) => {
  // Define the height constants based on props
  const BOTTOM_SHEET_MAX_HEIGHT = maxHeight;
  const BOTTOM_SHEET_MIN_HEIGHT = minHeight;
  const MAX_UPWARD_TRANSLATE_Y =
    BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;

  // Initialize animatedValue with the initial translateY value
  const animatedValue = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT)
  ).current;

  const lastGestureDy = useRef(0);

  const handleTouchOutside = (event) => {
    if (event.nativeEvent.locationY < BOTTOM_SHEET_MIN_HEIGHT) {
      closeSheet();
    }
  };

  // Define the panResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animatedValue.setOffset(lastGestureDy.current);
      },
      onPanResponderMove: (e, gesture) => {
        animatedValue.setValue(gesture.dy);
      },
      onPanResponderRelease: (e, gesture) => {
        animatedValue.flattenOffset();
        lastGestureDy.current += gesture.dy;

        // Close the bottom sheet if dragged down beyond CLOSE_THRESHOLD
        if (gesture.moveY - gesture.y0 > CLOSE_THRESHOLD) {
          closeSheet();
        }

        if (gesture.dy > 0) {
          // dragging down
          if (gesture.dy <= DRAG_THRESHOLD) {
            springAnimation("up");
          } else {
            springAnimation("down");
          }
        } else {
          // dragging up
          if (gesture.dy >= -DRAG_THRESHOLD) {
            springAnimation("down");
          } else {
            springAnimation("up");
          }
        }
      },
    })
  ).current;

  // Define the springAnimation function
  const springAnimation = (direction) => {
    console.log("direction", direction);
    lastGestureDy.current =
      direction === "down" ? MAX_DOWNWARD_TRANSLATE_Y : MAX_UPWARD_TRANSLATE_Y;
    Animated.spring(animatedValue, {
      toValue: lastGestureDy.current,
      useNativeDriver: true,
    }).start();
  };

  // Define the animation for the bottom sheet
  const bottomSheetAnimation = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          outputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  // Return the component layout
  return (
    <View onStartShouldSetResponder={closeSheet}>
      <Animated.View
        style={[
          styles.bottomSheet(BOTTOM_SHEET_MAX_HEIGHT, BOTTOM_SHEET_MIN_HEIGHT),
          bottomSheetAnimation,
        ]}
      >
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
          <View style={styles.contentWrapper}>
            <View style={styles.content}>
              <Text>{children}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// Update StyleSheet to use a function for dynamic styles
const styles = StyleSheet.create({
  bottomSheet: (maxHeight, minHeight) => ({
    position: "absolute",
    width: "100%",
    height: maxHeight,
    bottom: minHeight - maxHeight,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: "#a8bed2",
        shadowOpacity: 1,
        shadowRadius: 6,
        shadowOffset: {
          width: 2,
          height: 2,
        },
      },
    }),
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  }),

  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "95%",
    height: "100%",
    alignItems: "flex-start",
    marginVertical: 30,
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 5,
  },

  // content: {
  //   marginTop: 20,
  // },
  draggableArea: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dragHandle: {
    width: 100,
    height: 6,
    backgroundColor: "#d3d3d3",
    borderRadius: 10,
    position: "absolute",
    top: 10,
  },
});

export default DraggableBottomSheet;
