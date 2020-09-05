import { key } from './key.js';

const search = async () => {
	try {
		const response = await axios.get('https://www.hikingproject.com/data/get-trails?', {
			params: {
				key: key,
				lat: lat,
				lon: lon,
				maxDistance: 200,
				maxResults: 20
			}
		});

		console.log(response.data);
		renderTrails(response.data, 'current');
	} catch (error) {
		console.log(error);
		return;
	}
};
