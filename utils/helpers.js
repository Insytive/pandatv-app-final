import { Dimensions } from "react-native";

export const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } =
  Dimensions.get("window");

export function timeElapsedSince(timestampStr) {
  // Parse the timestamp into a datetime object
  const timestamp = new Date(timestampStr);

  // Get the current time
  const now = new Date();

  // Calculate the time difference in milliseconds
  const timeDiff = now - timestamp;

  // Convert time difference to seconds, minutes, hours, days, months, and years
  const seconds = timeDiff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30;
  const years = days / 365;

  // Format the time difference into a human-readable string
  if (years > 1) {
    return `${Math.floor(years)} yrs`;
  } else if (months > 1) {
    return `${Math.floor(months)} mon`;
  } else if (days > 1) {
    return `${Math.floor(days)} days`;
  } else if (hours > 1) {
    return `${Math.floor(hours)} hrs`;
  } else if (minutes > 1) {
    return `${Math.floor(minutes)} min`;
  } else {
    return "Just now";
  }
}
