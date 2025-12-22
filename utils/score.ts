export const getTwoDigits = (n: number): [number, number] => {
	const tens = Math.floor(n / 10);
	const units = n % 10;
	return tens === 0 ? [0, units] : [tens, units];
};
