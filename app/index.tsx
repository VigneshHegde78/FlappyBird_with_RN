import React, { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	ImageBackground,
	Text,
	TouchableWithoutFeedback,
	View,
} from "react-native";

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
	const birdSize = 50; // Size of the bird square

	// Pipes
	const pipeWidth = 70;
	const gap = 200; // gap between top and bottom pipe
	const pipeSpeed = 5;
	const [pipeLeft, setPipeLeft] = useState(screenWidth);
	const [pipeLeft2, setPipeLeft2] = useState(
		screenWidth + screenWidth / 2 + 100
	);
	const randomBottom = () =>
		Math.floor(Math.random() * (screenHeight - gap - 200)) + 100;
	const [pipeBottom, setPipeBottom] = useState(randomBottom());
	const [pipeBottom2, setPipeBottom2] = useState(randomBottom());
	const [isGameOver, setIsGameOver] = useState(false);

	// 3. The "Game Loop" - This simulates Gravity
	useEffect(() => {
		// Use a numeric timer id and only depend on `gameHasStarted` so
		// the interval isn't recreated on every `birdBottom` change.
		let gameTimerId: number | undefined;

		if (gameHasStarted) {
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
	}, [gameHasStarted]);

	// Pipes movement
	useEffect(() => {
		let pipeTimerId: number | undefined;

		if (gameHasStarted) {
			pipeTimerId = setInterval(() => {
				setPipeLeft((p) => p - pipeSpeed);
				setPipeLeft2((p) => p - pipeSpeed);
			}, 30);
		}

		return () => {
			if (pipeTimerId) clearInterval(pipeTimerId);
		};
	}, [gameHasStarted]);

	// Reset pipes when off screen and score when passing
	useEffect(() => {
		if (pipeLeft < -pipeWidth) {
			setPipeLeft(screenWidth);
			setPipeBottom(
				Math.floor(Math.random() * (screenHeight - gap - 200)) + 100
			);
		}
		if (pipeLeft2 < -pipeWidth) {
			setPipeLeft2(screenWidth);
			setPipeBottom2(
				Math.floor(Math.random() * (screenHeight - gap - 200)) + 100
			);
		}
		// scoring when pipe passes the bird center
		const birdLeft = screenWidth / 2 - birdSize / 2;
		// score for pipe 1
		if (
			pipeLeft + pipeWidth < birdLeft &&
			pipeLeft + pipeWidth > birdLeft - pipeSpeed
		) {
			setScore((s) => s + 1);
		}
		// score for pipe 2
		if (
			pipeLeft2 + pipeWidth < birdLeft &&
			pipeLeft2 + pipeWidth > birdLeft - pipeSpeed
		) {
			setScore((s) => s + 1);
		}
	}, [pipeLeft, pipeLeft2, screenWidth, screenHeight]);

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

	// 4. The Jump Function
	const jump = () => {
		if (!gameHasStarted) {
			setGameHasStarted(true);
		} else {
			// Move the bird UP
			setBirdBottom((b) => b + jumpHeight);
			setScore((s) => s + 1); // Fake score for fun
		}
	};

	const restart = () => {
		setIsGameOver(false);
		setScore(0);
		setBirdBottom(screenHeight / 2);
		setPipeLeft(screenWidth);
		setPipeLeft2(screenWidth + screenWidth / 2 + 100);
		setPipeBottom(randomBottom());
		setPipeBottom2(randomBottom());
		setGameHasStarted(false);
	};

	return (
		<View style={{ flex: 1 }}>
			<TouchableWithoutFeedback onPress={jump}>
				<ImageBackground
					source={require("../assets/images/bg_day.png")}
					resizeMode="cover"
					style={{
						flex: 1,
						width: screenWidth,
						height: screenHeight * 0.85,
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

					{/* Start Text */}
					{!gameHasStarted && !isGameOver && (
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text
								style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
							>
								Tap to Start
							</Text>
						</View>
					)}

					{/* Score */}
					{gameHasStarted && (
						<Text
							style={{
								position: "absolute",
								top: 100,
								fontSize: 50,
								color: "white",
								fontWeight: "bold",
							}}
						>
							{score}
						</Text>
					)}

					{/* Game Over overlay */}
					{isGameOver && (
						<TouchableWithoutFeedback onPress={restart}>
							<View
								style={{
									position: "absolute",
									alignItems: "center",
									justifyContent: "center",
									width: screenWidth,
									height: screenHeight,
									backgroundColor: "rgba(0,0,0,0.4)",
								}}
							>
								<Text
									style={{ fontSize: 48, color: "white", fontWeight: "bold" }}
								>
									Game Over
								</Text>
								<Text style={{ fontSize: 24, color: "white", marginTop: 8 }}>
									Tap to Restart
								</Text>
							</View>
						</TouchableWithoutFeedback>
					)}
				</ImageBackground>
			</TouchableWithoutFeedback>
			<ImageBackground
				source={require("../assets/images/ground.png")}
				resizeMode="cover"
				style={{
					position: "absolute",
					bottom: 0,
					width: screenWidth,
					height: screenHeight * 0.15,
				}}
			/>
		</View>
	);
}
