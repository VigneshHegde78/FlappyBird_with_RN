import React from "react";
import { Image, View } from "react-native";

export function PipePair({
	left,
	bottom,
	pipeWidth,
	gap,
	capHeight,
	screenHeight,
}: {
	left: number;
	bottom: number;
	pipeWidth: number;
	gap: number;
	capHeight: number;
	screenHeight: number;
}) {
	const topHeight = screenHeight - (bottom + gap);
	return (
		<>
			{/* Bottom pipe */}
			<View
				pointerEvents="none"
				style={{
					position: "absolute",
					width: pipeWidth,
					height: bottom,
					left,
					bottom: 0,
				}}
			>
				<Image
					source={require("../assets/images/pipe.png")}
					resizeMode="stretch"
					style={{ width: "100%", height: "100%" }}
				/>
			</View>
			{/* Bottom cap */}
			<View
				pointerEvents="none"
				style={{
					position: "absolute",
					width: pipeWidth,
					height: capHeight,
					left,
					bottom,
				}}
			>
				<Image
					source={require("../assets/images/cap.png")}
					resizeMode="stretch"
					style={{ width: "100%", height: "100%" }}
				/>
			</View>
			{/* Top pipe */}
			<View
				pointerEvents="none"
				style={{
					position: "absolute",
					width: pipeWidth,
					height: topHeight,
					left,
					top: 0,
				}}
			>
				<Image
					source={require("../assets/images/pipe.png")}
					resizeMode="stretch"
					style={{ width: "100%", height: "100%" }}
				/>
			</View>
			{/* Top cap */}
			<View
				pointerEvents="none"
				style={{
					position: "absolute",
					width: pipeWidth,
					height: capHeight,
					left,
					top: topHeight - capHeight,
					transform: [{ rotate: "180deg" }],
				}}
			>
				<Image
					source={require("../assets/images/cap.png")}
					resizeMode="stretch"
					style={{ width: "100%", height: "100%" }}
				/>
			</View>
		</>
	);
}
