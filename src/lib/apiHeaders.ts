interface headers {
	"Client-ID": string;
	Authorization: string;
}

const apiHeaders: headers = {
	"Client-ID": import.meta.env.VITE_CLIENT_ID,
	Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`,
};

export default apiHeaders;
