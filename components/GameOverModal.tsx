import React, { useEffect } from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import { scoreImages } from "../utils/digits";

export function GameOverModal({
	visible,
	isGameOver,
	onRequestClose,
	onTap,
	onResetScore,
	isPaused,
	score,
	bestScore,
	onPauseChange,
}: {
	visible: boolean;
	isGameOver: boolean;
	isPaused: boolean;
	onRequestClose: () => void;
	onTap: () => void;
	onResetScore: (data: { score: number; bestScore: number }) => void;
	score: number;
	bestScore: number;
	onPauseChange?: (paused: boolean) => void;
}) {
	useEffect(() => {
		if (visible && onPauseChange) {
			onPauseChange(true);
		}
	}, [visible, onPauseChange]);

	const getTensUnits = (n: number) => {
		const tens = Math.floor(n / 10);
		const units = n % 10;
		return tens === 0 ? [0, units] : [tens, units];
	};

	const [scoreTens, scoreUnits] = getTensUnits(score);
	const [bestTens, bestUnits] = getTensUnits(bestScore);
	const screenHeight = Dimensions.get("screen").height;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onRequestClose}
		>
			<TouchableOpacity
				onPress={onTap}
				activeOpacity={1}
				style={{
					flex: 1,
					backgroundColor: "rgba(0,0,0,0.5)",
					justifyContent: "flex-start",
					paddingTop: screenHeight * 0.3,
					alignItems: "center",
					paddingHorizontal: 20,
				}}
			>
				<View style={{ alignItems: "center", gap: 2, width: "100%" }}>
					{isGameOver && (
						<Image source={require("../assets/images/gameover.png")} />
					)}
					<View style={{ alignItems: "center" }}>
						<Image
							source={require("../assets/images/board.png")}
							resizeMode="contain"
							style={{
								width: 320,
								height: 200,
								alignItems: "center",
								justifyContent: "center",
							}}
						/>

						{/* Medal selection */}
						{score >= bestScore && score > 0 && (
							<Image
								source={require("../assets/images/m1.png")}
								resizeMode="contain"
								style={{
									position: "absolute",
									top: 78,
									left: 44,
									width: 55,
									height: 55,
								}}
							/>
						)}
						{score < bestScore && score >= bestScore/2 && (
							<Image
								source={require("../assets/images/m2.png")}
								resizeMode="contain"
								style={{
									position: "absolute",
									top: 78,
									left: 44,
									width: 55,
									height: 55,
								}}
							/>
						)}
						{score < bestScore/2 && score >= 0 && (
							<Image
								source={require("../assets/images/m3.png")}
								resizeMode="contain"
								style={{
									position: "absolute",
									top: 78,
									left: 44,
									width: 55,
									height: 55,
								}}
							/>
						)}

						{/* Current Score digits */}
						<View
							style={{
								flexDirection: "row",
								gap: 2,
								position: "absolute",
								top: 62,
								right: 45,
							}}
						>
							<Image
								source={scoreImages[scoreTens]}
								resizeMode="contain"
								style={{ width: 18, height: 30 }}
							/>
							<Image
								source={scoreImages[scoreUnits]}
								resizeMode="contain"
								style={{ width: 18, height: 30 }}
							/>
						</View>

						{/* Best Score digits */}
						<View
							style={{
								flexDirection: "row",
								gap: 2,
								position: "absolute",
								top: 118,
								right: 45,
							}}
						>
							<Image
								source={scoreImages[bestTens]}
								resizeMode="contain"
								style={{ width: 18, height: 30 }}
							/>
							<Image
								source={scoreImages[bestUnits]}
								resizeMode="contain"
								style={{ width: 18, height: 30 }}
							/>
						</View>

						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "flex-start",
							}}
						>
							<TouchableOpacity
								onPress={() => onResetScore({ score, bestScore })}
								activeOpacity={0.7}
							>
								<Image
									source={require("../assets/images/reset_score.png")}
									resizeMode="stretch"
									style={{ width: 210, height: 80 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity onPress={onTap} activeOpacity={0.7}>
								<Image
									source={require("../assets/images/play.png")}
									style={{ width: 78, height: 78 }}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		</Modal>
	);
}
