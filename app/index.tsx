import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	ImageBackground,
	Modal,
	StatusBar,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";

// Digit images 0-9 for modal score display
const scoreImages: { [key: number]: any } = {
	0: require("../assets/images/scores/0.png"),
	1: require("../assets/images/scores/1.png"),
	2: require("../assets/images/scores/2.png"),
	3: require("../assets/images/scores/3.png"),
	4: require("../assets/images/scores/4.png"),
	5: require("../assets/images/scores/5.png"),
	6: require("../assets/images/scores/6.png"),
	7: require("../assets/images/scores/7.png"),
	8: require("../assets/images/scores/8.png"),
	9: require("../assets/images/scores/9.png"),
};

// Helpers to show in-game two-digit text with leading zero
const getTwoDigits = (n: number): [number, number] => {
	const tens = Math.floor(n / 10);
	const units = n % 10;
	return tens === 0 ? [0, units] : [tens, units];
};

function TwoDigitDisplay({
	value,
	size = 50,
	color = "white",
}: {
	value: number;
	size?: number;
	color?: string;
}) {
	const [d1, d2] = getTwoDigits(value);
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
			<Text style={{ fontSize: size, color, fontWeight: "bold" }}>{d1}</Text>
			<Text style={{ fontSize: size, color, fontWeight: "bold" }}>{d2}</Text>
		</View>
	);
}

export default function App() {
	// 1. Get Screen Dimensions so we know where the "floor" is
	const screenWidth = Dimensions.get("screen").width;
	const screenHeight = Dimensions.get("screen").height;

	// 2. Game State
	// The bird starts in the middle of the screen (height / 2)
	const [birdBottom, setBirdBottom] = useState(screenHeight / 2);
	const [gameHasStarted, setGameHasStarted] = useState(false);
	const [score, setScore] = useState(0);

	// Constants
	const gravity = 7; // How fast it falls
	const jumpHeight = 50; // How high it jumps
	const birdSize = 55; // Size of the bird square

	// Pipes
	const pipeWidth = 70;
	const gap = 200; // gap between top and bottom pipe
	const pipeSpeed = 5;
	const capHeight = 25;
	const pipeHorizontalGap = screenWidth / 2 + 100; // consistent horizontal spacing between pipe pairs
	const [pipeLeft, setPipeLeft] = useState(screenWidth);
	const [pipeLeft2, setPipeLeft2] = useState(screenWidth + pipeHorizontalGap);
	const randomBottom = () =>
		Math.floor(Math.random() * (screenHeight - gap - 200)) + 100;
	const [pipeBottom, setPipeBottom] = useState(randomBottom());
	const [pipeBottom2, setPipeBottom2] = useState(randomBottom());
	const [isGameOver, setIsGameOver] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [passed1, setPassed1] = useState(false);
	const [passed2, setPassed2] = useState(false);

	// Best score state
	const [bestScore, setBestScore] = useState(0);
	const [showBestModal, setShowBestModal] = useState(false);

	// Load best score from storage on mount
	useEffect(() => {
		const loadBest = async () => {
			try {
				const stored = await AsyncStorage.getItem("flappyBirdBestScore");
				if (stored) setBestScore(Number(stored));
			} catch (error) {
				console.error("Failed to load best score:", error);
			}
		};
		loadBest();
	}, []);

	// Save best score to storage
	const saveBestScore = async (newBest: number) => {
		try {
			await AsyncStorage.setItem("flappyBirdBestScore", String(newBest));
		} catch (error) {
			console.error("Failed to save best score:", error);
		}
	};

	// 3. The "Game Loop" - This simulates Gravity
	useEffect(() => {
		// Use a numeric timer id and only depend on `gameHasStarted` so
		// the interval isn't recreated on every `birdBottom` change.
		let gameTimerId: number | undefined;

		if (gameHasStarted && !isPaused && !isGameOver) {
			gameTimerId = setInterval(() => {
				setBirdBottom((prevBottom) => {
					const newBottom = prevBottom - gravity;
					if (newBottom <= 0) {
						if (gameTimerId) clearInterval(gameTimerId);
						return 0;
					}
					return newBottom;
				});
			}, 30);
		}

		return () => {
			if (gameTimerId) {
				clearInterval(gameTimerId);
			}
		};
	}, [gameHasStarted, isPaused, isGameOver]);

	// Pipes movement
	useEffect(() => {
		let pipeTimerId: number | undefined;

		if (gameHasStarted && !isPaused && !isGameOver) {
			pipeTimerId = setInterval(() => {
				setPipeLeft((p) => p - pipeSpeed);
				setPipeLeft2((p) => p - pipeSpeed);
			}, 30);
		}

		return () => {
			if (pipeTimerId) clearInterval(pipeTimerId);
		};
	}, [gameHasStarted, isPaused, isGameOver]);

	// Reset pipes when off screen and score when passing
	useEffect(() => {
		// keep consistent spacing by spawning off-screen to the right of the rightmost pipe
		let nextPipeLeft = pipeLeft;
		let nextPipeLeft2 = pipeLeft2;
		if (pipeLeft < -pipeWidth) {
			const newX = Math.max(
				screenWidth,
				Math.max(pipeLeft, pipeLeft2) + pipeHorizontalGap
			);
			nextPipeLeft = newX;
			setPipeLeft(newX);
			setPipeBottom(
				Math.floor(Math.random() * (screenHeight - gap - 200)) + 100
			);
			setPassed1(false);
		}
		if (pipeLeft2 < -pipeWidth) {
			const newX2 = Math.max(
				screenWidth,
				Math.max(nextPipeLeft, pipeLeft2) + pipeHorizontalGap
			);
			nextPipeLeft2 = newX2;
			setPipeLeft2(newX2);
			setPipeBottom2(
				Math.floor(Math.random() * (screenHeight - gap - 200)) + 100
			);
			setPassed2(false);
		}
		// scoring when pipe passes the bird center
		const birdLeft = screenWidth / 2 - birdSize / 2;
		// score once per pipe pair when its trailing edge passes the bird
		if (pipeLeft + pipeWidth < birdLeft && !passed1) {
			setPassed1(true);
			setScore((s) => s + 1);
		}
		if (pipeLeft2 + pipeWidth < birdLeft && !passed2) {
			setPassed2(true);
			setScore((s) => s + 1);
		}
	}, [pipeLeft, pipeLeft2, screenWidth, screenHeight, passed1, passed2]);

	// Collision detection
	useEffect(() => {
		const birdLeft = screenWidth / 2 - birdSize / 2;
		const birdRight = birdLeft + birdSize;
		const birdTop = birdBottom + birdSize;

		const checkCollision = (pLeft: number, pBottom: number) => {
			const pRight = pLeft + pipeWidth;
			// bottom pipe: from bottom (0) up to pBottom
			const bottomPipeTop = pBottom;
			// top pipe: from top down to (screenHeight - (pBottom + gap))
			const topPipeBottom = pBottom + gap;

			const horizontalOverlap = !(birdRight < pLeft || birdLeft > pRight);
			if (!horizontalOverlap) return false;

			// if bird is below bottomPipeTop (hits bottom pipe) OR above topPipeBottom (hits top pipe)
			if (birdBottom < bottomPipeTop || birdTop > topPipeBottom) {
				return true;
			}
			return false;
		};

		if (
			checkCollision(pipeLeft, pipeBottom) ||
			checkCollision(pipeLeft2, pipeBottom2) ||
			birdBottom <= 0 ||
			birdBottom + birdSize >= screenHeight - 100
		) {
			// Game over
			setGameHasStarted(false);
			setIsGameOver(true);
		}
	}, [
		birdBottom,
		pipeLeft,
		pipeLeft2,
		pipeBottom,
		pipeBottom2,
		screenWidth,
		screenHeight,
	]);

	// Show high score modal when game ends
	useEffect(() => {
		if (isGameOver) {
			handleGameOver();
		}
	}, [isGameOver]);

	// 4. The Jump Function
	const jump = () => {
		if (isGameOver || isPaused) return;
		if (!gameHasStarted) {
			setGameHasStarted(true);
			setIsPaused(false);
			return;
		}
		// Move the bird UP
		setBirdBottom((b) => b + jumpHeight);
	};

	const restart = () => {
		setIsGameOver(false);
		setIsPaused(false);
		setScore(0);
		setBirdBottom(screenHeight / 2);
		setPipeLeft(screenWidth);
		setPipeLeft2(screenWidth + pipeHorizontalGap);
		setPipeBottom(randomBottom());
		setPipeBottom2(randomBottom());
		setGameHasStarted(false);
		setPassed1(false);
		setPassed2(false);
		setShowBestModal(false);
	};

	const togglePause = () => {
		if (!gameHasStarted || isGameOver) return;
		setIsPaused((prev) => !prev);
	};

	const handleGameOver = () => {
		if (score > bestScore) {
			setBestScore(score);
			saveBestScore(score);
		}
		setShowBestModal(true);
	};

	return (
		<View style={{ flex: 1 }}>
			<StatusBar hidden={true} />
			<TouchableWithoutFeedback onPress={jump}>
				<ImageBackground
					source={require("../assets/images/bg_day.png")}
					resizeMode="cover"
					style={{
						flex: 1,
						width: screenWidth,
						height: screenHeight * 0.8,
						alignItems: "center",
					}}
				>
					{/* The Bird */}
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: birdSize,
							height: birdSize,
							bottom: birdBottom, // This changes constantly to move the bird
							left: screenWidth / 2 - birdSize / 2, // Center horizontally
						}}
					>
						<Image
							source={require("../assets/images/birdy.png")}
							resizeMode="contain"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>

					{/* Pipes (images) */}
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: pipeBottom,
							left: pipeLeft,
							bottom: 0,
						}}
					>
						<Image
							source={require("../assets/images/pipe.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: capHeight,
							left: pipeLeft,
							bottom: pipeBottom,
						}}
					>
						<Image
							source={require("../assets/images/cap.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: screenHeight - (pipeBottom + gap),
							left: pipeLeft,
							top: 0,
						}}
					>
						<Image
							source={require("../assets/images/pipe.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: screenHeight - (pipeBottom + gap),
							left: pipeLeft,
							top: 0,
						}}
					>
						<Image
							source={require("../assets/images/pipe.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: capHeight,
							left: pipeLeft,
							top: screenHeight - (pipeBottom + gap) - capHeight,
							transform: [{ rotate: "180deg" }],
						}}
					>
						<Image
							source={require("../assets/images/cap.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>

					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: pipeBottom2,
							left: pipeLeft2,
							bottom: 0,
						}}
					>
						<Image
							source={require("../assets/images/pipe.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: capHeight,
							left: pipeLeft2,
							bottom: pipeBottom2,
						}}
					>
						<Image
							source={require("../assets/images/cap.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: screenHeight - (pipeBottom2 + gap),
							left: pipeLeft2,
							top: 0,
						}}
					>
						<Image
							source={require("../assets/images/pipe.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: pipeWidth,
							height: capHeight,
							left: pipeLeft2,
							top: screenHeight - (pipeBottom2 + gap) - capHeight,
							transform: [{ rotate: "180deg" }],
						}}
					>
						<Image
							source={require("../assets/images/cap.png")}
							resizeMode="stretch"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>

					{/* Start Text */}
					{!gameHasStarted && !isGameOver && (
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
								position: "absolute",
								top: screenHeight / 2 - 250,
								gap: 100,
							}}
						>
							<Image
								source={require("../assets/images/get_ready.png")}
								resizeMode="contain"
							/>
							<Image
								source={require("../assets/images/tap.png")}
								resizeMode="contain"
								style={{ width: 150, height: 130 }}
							/>
						</View>
					)}

					{/* Score */}
					{gameHasStarted && (
						<View style={{ position: "absolute", top: 100 }}>
							<Image
								source={scoreImages[score]}
								resizeMode="contain"
								style={{
									width: 120,
									height: 45,
									justifyContent: "center",
									alignItems: "center",
								}}
							/>
						</View>
					)}

					{/* Pause/Resume Button */}
					{gameHasStarted && !isGameOver && (
						<TouchableOpacity
							onPress={togglePause}
							style={{
								position: "absolute",
								top: 35,
								left: 20,
								padding: 8,
							}}
						>
							<FontAwesome6
								name={isPaused ? "play" : "pause"}
								size={32}
								color="white"
							/>
						</TouchableOpacity>
					)}

					{/* Leaderboard Button */}
					<TouchableOpacity
						onPress={() => setShowBestModal(true)}
						style={{
							position: "absolute",
							top: 35,
							right: 20,
							paddingRight: 8,
							paddingTop: 2,
							gap: 0,
							alignItems: "center",
						}}
					>
						<MaterialIcons name="leaderboard" size={32} color="gold" />
						<Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
							BEST
						</Text>
					</TouchableOpacity>
				</ImageBackground>
			</TouchableWithoutFeedback>

			{/* Game Over Modal with Scores */}
			<Modal
				visible={isGameOver || showBestModal}
				transparent
				animationType="fade"
				onRequestClose={() => {
					if (isGameOver) {
						restart();
					} else {
						setShowBestModal(false);
					}
				}}
			>
				<TouchableOpacity
					onPress={() => {
						if (isGameOver) {
							restart();
						} else {
							setShowBestModal(false);
						}
					}}
					style={{
						flex: 1,
						backgroundColor: "rgba(0,0,0,0.5)",
						justifyContent: "center",
						alignItems: "center",
						paddingHorizontal: 20,
					}}
					activeOpacity={1}
				>
					<View
						style={{
							alignItems: "center",
							gap: 2,
							width: "100%",
						}}
					>
						{isGameOver && (
							<Image source={require("../assets/images/gameover.png")} />
						)}
						<View
							style={{
								alignItems: "center",
							}}
						>
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

							{/* Medal */}
							{score > bestScore && score > 0 && (
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

							{/* Medal */}
							{score === bestScore && score > 0 && (
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

							{/* Medal */}
							{score < bestScore && score >= 0 && (
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

							{/* Current Score */}
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
									source={scoreImages[score >= 10 ? Math.floor(score / 10) : 0]}
									resizeMode="contain"
									style={{ width: 18, height: 30 }}
								/>
								<Image
									source={
										scoreImages[score >= 10 ? Math.floor(score % 10) : score]
									}
									resizeMode="contain"
									style={{ width: 18, height: 30 }}
								/>
							</View>

							{/* Best Score */}
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
									source={
										scoreImages[
											bestScore >= 10 ? Math.floor(bestScore / 10) : 0
										]
									}
									resizeMode="contain"
									style={{ width: 18, height: 30 }}
								/>
								<Image
									source={
										scoreImages[
											bestScore >= 10 ? Math.floor(bestScore % 10) : bestScore
										]
									}
									resizeMode="contain"
									style={{ width: 18, height: 30 }}
								/>
							</View>
						</View>
					</View>
				</TouchableOpacity>
			</Modal>

			<ImageBackground
				source={require("../assets/images/ground.png")}
				resizeMode="cover"
				style={{
					position: "absolute",
					bottom: 0,
					width: screenWidth,
					height: screenHeight * 0.2,
				}}
			/>
		</View>
	);
}
