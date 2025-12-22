import React from "react";
import { Image, View } from "react-native";

export function Bird({
	birdBottom,
	birdSize,
	screenWidth,
	isPaused,
	isTapping,
}: {
	birdBottom: number;
	birdSize: number;
	screenWidth: number;
	isPaused: boolean;
	isTapping: boolean;
}) {
	const getBirdImage = () => {
		if (isPaused) {
			return require("../assets/images/birdy_mid.png");
		}
		if (isTapping) {
			return require("../assets/images/birdy_up.png");
		}
		return require("../assets/images/birdy_down.png");
	};

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
				source={getBirdImage()}
				resizeMode="contain"
				style={{ width: "100%", height: "100%" }}
			/>
		</View>
	);
}
