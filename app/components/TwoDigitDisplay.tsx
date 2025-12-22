import React from "react";
import { Text, View } from "react-native";
import { getTwoDigits } from "../utils/score";

export function TwoDigitDisplay({
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
