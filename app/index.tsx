import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Image,
	ImageBackground,
	StatusBar,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { Bird } from "../components/Bird";
import { GameOverModal } from "../components/GameOverModal";
import { PipePair } from "../components/PipePair";
import { scoreImages } from "../utils/digits";

export default function App() {
	// 1. Get Screen Dimensions
	const screenWidth = Dimensions.get("screen").width;
	const screenHeight = Dimensions.get("screen").height;

	// 2. Game State
	const [birdBottom, setBirdBottom] = useState(screenHeight / 2);
	const [gameHasStarted, setGameHasStarted] = useState(false);
	const [score, setScore] = useState(0);

	// --- NEW PHYSICS CONSTANTS & REF ---
	const gravity = 1.0; // Gravity acts as acceleration downwards
	const jumpStrength = 10; // Initial upward velocity when jumping
	const birdVelocity = useRef(0); // Tracks current vertical speed
	// -----------------------------------

	const birdSize = 55;
	const pipeWidth = 70;
	const gap =
		score > 50
			? 200
			: score > 40
			? 210
			: score > 30
			? 220
			: score > 20
			? 230
			: score > 10
			? 240
			: 250;
	const pipeSpeed = 5;
	const capHeight = 25;
	const pipeHorizontalGap = screenWidth / 2 + 120;

	const [pipeLeft, setPipeLeft] = useState(screenWidth);
	const [pipeLeft2, setPipeLeft2] = useState(screenWidth + pipeHorizontalGap);

	const randomBottom = () =>
		Math.floor(Math.random() * (screenHeight - gap - 200)) + 100;

	const [pipeBottom, setPipeBottom] = useState(randomBottom());
	const [pipeBottom2, setPipeBottom2] = useState(randomBottom());

	const [isGameOver, setIsGameOver] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isTapping, setIsTapping] = useState(false);
	const [passed1, setPassed1] = useState(false);
	const [passed2, setPassed2] = useState(false);

	// Best score state
	const [bestScore, setBestScore] = useState(0);
	const [showBestModal, setShowBestModal] = useState(false);

	// Load best score
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

	const saveBestScore = async (newBest: number) => {
		try {
			await AsyncStorage.setItem("flappyBirdBestScore", String(newBest));
		} catch (error) {
			console.error("Failed to save best score:", error);
		}
	};

	// Sound setup
	const jumpSound = useRef<Audio.Sound | null>(null);
	const dieSound = useRef<Audio.Sound | null>(null);
	const hitSound = useRef<Audio.Sound | null>(null);
	const pointSound = useRef<Audio.Sound | null>(null);

	useEffect(() => {
		let isMounted = true;
		const loadSounds = async () => {
			try {
				const [jump, die, hit, point] = await Promise.all([
					Audio.Sound.createAsync(require("../assets/audio/wing.wav")),
					Audio.Sound.createAsync(require("../assets/audio/die.wav")),
					Audio.Sound.createAsync(require("../assets/audio/hit.wav")),
					Audio.Sound.createAsync(require("../assets/audio/point.wav")),
				]);
				if (isMounted) {
					jumpSound.current = jump.sound;
					dieSound.current = die.sound;
					hitSound.current = hit.sound;
					pointSound.current = point.sound;
				}
			} catch (error) {
				console.warn("Failed to load sounds:", error);
			}
		};
		loadSounds();
		return () => {
			isMounted = false;
			jumpSound.current?.unloadAsync();
			dieSound.current?.unloadAsync();
			hitSound.current?.unloadAsync();
			pointSound.current?.unloadAsync();
		};
	}, []);

	const playJumpSound = async () => {
		try {
			await jumpSound.current?.replayAsync();
		} catch (e) {}
	};
	const playDieSound = async () => {
		try {
			await dieSound.current?.replayAsync();
		} catch (e) {}
	};
	const playHitSound = async () => {
		try {
			await hitSound.current?.replayAsync();
		} catch (e) {}
	};
	const playPointSound = async () => {
		try {
			await pointSound.current?.replayAsync();
		} catch (e) {}
	};

	// 3. UPDATED GAME LOOP (Physics)
	useEffect(() => {
		let gameTimerId: number | undefined;

		if (gameHasStarted && !isPaused && !isGameOver) {
			gameTimerId = setInterval(() => {
				// Apply gravity to velocity
				birdVelocity.current -= gravity;

				setBirdBottom((prevBottom) => {
					// Apply velocity to position
					const newBottom = prevBottom + birdVelocity.current;

					// Prevent falling below floor (simple clamp)
					if (newBottom <= 0) {
						return 0;
						// Note: collision detection will handle the game over logic
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

	// Reset pipes and scoring
	useEffect(() => {
		let nextPipeLeft = pipeLeft;
		let nextPipeLeft2 = pipeLeft2;

		if (pipeLeft < -pipeWidth) {
			const newX = Math.max(
				screenWidth,
				Math.max(pipeLeft, pipeLeft2) + pipeHorizontalGap
			);
			nextPipeLeft = newX;
			setPipeLeft(newX);
			setPipeBottom(randomBottom());
			setPassed1(false);
		}
		if (pipeLeft2 < -pipeWidth) {
			const newX2 = Math.max(
				screenWidth,
				Math.max(nextPipeLeft, pipeLeft2) + pipeHorizontalGap
			);
			nextPipeLeft2 = newX2;
			setPipeLeft2(newX2);
			setPipeBottom2(randomBottom());
			setPassed2(false);
		}

		// Scoring
		const birdLeft = screenWidth / 2 - birdSize / 2;
		if (pipeLeft + pipeWidth < birdLeft && !passed1) {
			setPassed1(true);
			setScore((s) => s + 1);
			playPointSound();
		}
		if (pipeLeft2 + pipeWidth < birdLeft && !passed2) {
			setPassed2(true);
			setScore((s) => s + 1);
			playPointSound();
		}
	}, [pipeLeft, pipeLeft2, screenWidth, screenHeight, passed1, passed2]);

	// Collision detection
	useEffect(() => {
		const birdLeft = screenWidth / 2 - birdSize / 2;
		const birdRight = birdLeft + birdSize;
		const birdTop = birdBottom + birdSize;

		const checkCollision = (pLeft: number, pBottom: number) => {
			const pRight = pLeft + pipeWidth;
			const bottomPipeTop = pBottom;
			const topPipeBottom = pBottom + gap;

			const horizontalOverlap = !(birdRight < pLeft || birdLeft > pRight);
			if (!horizontalOverlap) return false;

			if (birdBottom < bottomPipeTop || birdTop > topPipeBottom) {
				return true;
			}
			return false;
		};

		if (
			checkCollision(pipeLeft, pipeBottom) ||
			checkCollision(pipeLeft2, pipeBottom2)
		) {
			playHitSound();
			setGameHasStarted(false);
			setIsGameOver(true);
		} else if (birdBottom <= 0 || birdBottom + birdSize >= screenHeight - 50) {
			// Hit ground or ceiling
			playHitSound();
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

	useEffect(() => {
		if (isGameOver) {
			handleGameOver();
		}
	}, [isGameOver]);

	useEffect(() => {
		if (showBestModal && gameHasStarted && !isGameOver) {
			setIsPaused(true);
		}
	}, [showBestModal, gameHasStarted, isGameOver]);

	// 4. UPDATED JUMP FUNCTION
	const jump = () => {
		if (isGameOver || isPaused) return;

		playJumpSound();

		if (!gameHasStarted) {
			setGameHasStarted(true);
			setIsPaused(false);
			// Initialize velocity on first tap
			birdVelocity.current = jumpStrength;
		} else {
			// Set upward velocity (Physics jump)
			birdVelocity.current = jumpStrength;
		}

		setIsTapping(true);
		setTimeout(() => setIsTapping(false), 200);
	};

	const restart = () => {
		setIsGameOver(false);
		setIsPaused(false);
		setScore(0);
		setBirdBottom(screenHeight / 2);

		// Reset velocity
		birdVelocity.current = 0;

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
		playDieSound();
		if (score > bestScore) {
			setBestScore(score);
			saveBestScore(score);
		}
		setShowBestModal(true);
	};

	const resetScore = async ({
		score,
		bestScore,
	}: {
		score: number;
		bestScore: number;
	}) => {
		// Implement score reset logic here
		score = 0;
		bestScore = 0;
		await AsyncStorage.removeItem("flappyBirdBestScore");
		setBestScore(0);
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
					{/* Bird */}
					<Bird
						birdBottom={birdBottom}
						birdSize={birdSize}
						screenWidth={screenWidth}
						isPaused={isPaused}
						isTapping={isTapping}
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

					{/* Start Screen */}
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

					{/* Score Display */}
					{gameHasStarted && (
						<View
							style={{
								position: "absolute",
								top: 135,
								flexDirection: "row",
								gap: 4,
							}}
						>
							{score >= 10 && (
								<Image
									source={scoreImages[Math.floor(score / 10)]}
									resizeMode="contain"
									style={{ width: 30, height: 45 }}
								/>
							)}
							<Image
								source={scoreImages[score % 10]}
								resizeMode="contain"
								style={{ width: 30, height: 45 }}
							/>
						</View>
					)}

					{/* Controls */}
					{gameHasStarted && !isGameOver && (
						<TouchableOpacity
							onPress={togglePause}
							style={{
								position: "absolute",
								top: 20,
								left: 15,
								padding: 8,
							}}
						>
							<Image
								source={
									isPaused
										? require("../assets/images/play.png")
										: require("../assets/images/pause.png")
								}
								resizeMode="contain"
								style={{ width: 48, height: 48 }}
							/>
						</TouchableOpacity>
					)}

					{!isGameOver && (
						<TouchableOpacity
							onPress={() => setShowBestModal(true)}
							style={{
								position: "absolute",
								top: 20,
								right: 15,
								padding: 8,
							}}
						>
							<Image
								source={require("../assets/images/trophy.png")}
								resizeMode="contain"
								style={{ width: 50, height: 50 }}
							/>
						</TouchableOpacity>
					)}

					<GameOverModal
						visible={isGameOver || showBestModal}
						isGameOver={isGameOver}
						onRequestClose={() => {
							if (isGameOver) restart();
							else {setShowBestModal(false); setIsPaused(false);}
						}}
						onTap={() => {
							if (isGameOver) restart();
							else {setShowBestModal(false); setIsPaused(false);}
						}}
						score={score}
						bestScore={bestScore}
						onResetScore={resetScore}
						isPaused={isPaused}
						onPauseChange={setIsPaused}
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
