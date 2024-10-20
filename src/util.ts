export const parseCookie = (str: string) =>
	str
		.split(';')
		.map((v) => v.split('='))
		.reduce(
			(acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			},
			{} as { [index in string]?: string },
		);

export const generateRandomString = (charCount = 6): string => {
	const str = Math.random().toString(36).substring(2).slice(-charCount);
	return str.length < charCount ? str + 'a'.repeat(charCount - str.length) : str;
};
