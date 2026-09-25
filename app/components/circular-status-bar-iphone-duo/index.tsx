import React from "react";
import { StyleSheet, View } from "react-native";
import { CircularStatusBarIphoneDuo } from "@/components/micro-interactions/circular-status-bar-iphone-duo";
import { Showcase } from "~/showcase";

export default function CircularStatusBarIphoneDuoScreen() {
  return (
    <Showcase disableBackButton>
      <View style={styles.container}>
        <CircularStatusBarIphoneDuo size={220} reverse />
      </View>
    </Showcase>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
