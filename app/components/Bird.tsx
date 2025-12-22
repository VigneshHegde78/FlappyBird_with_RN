import React from "react";
import { Image, View } from "react-native";

export function Bird({
	birdBottom,
	birdSize,
	screenWidth,
}: {
	birdBottom: number;
	birdSize: number;
	screenWidth: number;
}) {
	return (
		<View
			pointerEvents="none"
			style={{
				position: "absolute",
				width: birdSize,
				height: birdSize,
				bottom: birdBottom,
				left: screenWidth / 2 - birdSize / 2,
			}}
		>
			<Image
				source={require("../../assets/images/birdy_down.png")}
				resizeMode="contain"
				style={{ width: "100%", height: "100%" }}
			/>
		</View>
	);
}
