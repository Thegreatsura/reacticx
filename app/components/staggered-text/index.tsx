import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StaggeredText } from "@/components/organisms/staggered-text";
import { Showcase } from "~/showcase";

const TEXTS: string[] = [
  "Do you love Reacticx!",
  "Isn't it amazing?",
  "Try it out now!",
];

export default function App(): React.ReactElement {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % TEXTS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Showcase>
      <View style={styles.container}>
        <StaggeredText
          texts={TEXTS}
          activeIndex={index}
          fontSize={35}
          height={500}
          animationConfig={{
            characterDelay: 30,
          }}
          enterTo={{
            translateY: 1,
            opacity: 0,
            blur: 15,
            scale: 0.5,
          }}
          exitTo={{
            translateY: -0.9,
            opacity: 0,
            blur: 15,
            scale: 0.5,
          }}
          color="#ffffff"
          letterSpacing={1}
          staggerFrom="leading"
        />
      </View>
    </Showcase>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0e",
    justifyContent: "center",
    alignItems: "center",
  },
});
