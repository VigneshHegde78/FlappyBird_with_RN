import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	ImageBackground,
	StatusBar,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { Bird } from "./components/Bird";
import { GameOverModal } from "./components/GameOverModal";
import { PipePair } from "./components/PipePair";
import { scoreImages } from "./utils/digits";

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
					<Bird
						birdBottom={birdBottom}
						birdSize={birdSize}
						screenWidth={screenWidth}
					/>

					{/* Pipes */}
					<PipePair
						left={pipeLeft}
						bottom={pipeBottom}
						pipeWidth={pipeWidth}
						gap={gap}
						capHeight={capHeight}
						screenHeight={screenHeight}
					/>
					<PipePair
						left={pipeLeft2}
						bottom={pipeBottom2}
						pipeWidth={pipeWidth}
						gap={gap}
						capHeight={capHeight}
						screenHeight={screenHeight}
					/>

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
						<View
							style={{
								position: "absolute",
								top: 130,
								flexDirection: "row",
								gap: 4,
							}}
						>
							{score >= 10 && (
								<Image
									source={scoreImages[score >= 10 ? Math.floor(score / 10) : 0]}
									resizeMode="contain"
									style={{ width: 30, height: 45 }}
								/>
							)}
							<Image
								source={scoreImages[score >= 10 ? score % 10 : score]}
								resizeMode="contain"
								style={{ width: 30, height: 45 }}
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

					{/* BEST Button */}
					{!isGameOver && (
						<TouchableOpacity
							onPress={() => setShowBestModal(true)}
							style={{
								position: "absolute",
								top: 35,
								right: 20,
								padding: 8,
							}}
						>
							<FontAwesome6 name="trophy" size={32} color="gold" />
						</TouchableOpacity>
					)}

					{/* Game Over Modal with Scores */}
					<GameOverModal
						visible={isGameOver || showBestModal}
						isGameOver={isGameOver}
						onRequestClose={() => {
							if (isGameOver) restart();
							else setShowBestModal(false);
						}}
						onTap={() => {
							if (isGameOver) restart();
							else setShowBestModal(false);
						}}
						score={score}
						bestScore={bestScore}
					/>
				</ImageBackground>
			</TouchableWithoutFeedback>

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
