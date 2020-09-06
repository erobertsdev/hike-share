const gallery = document.getElementById('main'),
	logout = document.getElementById('logout');

const examples = [
	{
		name: 'Pino Trail',
		city: 'Albuquerque',
		state: 'NM',
		distance: 7.1,
		difficulty: 'Hard',
		date: 'Sep 1st, 2020',
		time: '4 hours',
		images: [
			'./assets/img/placeholder.jpg',
			'./assets/img/placeholder2.jpg',
			'./assets/img/placeholder3.jpg',
			'./assets/img/placeholder4.jpg',
			'./assets/img/placeholder5.jpg'
		]
	},
	{
		name: 'La Luz Trail',
		city: 'Albuquerque',
		state: 'NM',
		distance: 13.1,
		difficulty: 'Difficult',
		date: 'Sep 2nd, 2020',
		time: '6.5 hours',
		images: [
			'./assets/img/placeholder.jpg',
			'./assets/img/placeholder2.jpg',
			'./assets/img/placeholder3.jpg',
			'./assets/img/placeholder4.jpg',
			'./assets/img/placeholder5.jpg'
		]
	},
	{
		name: 'Piedra Lisa',
		city: 'Albuquerque',
		state: 'NM',
		distance: 3.5,
		difficulty: 'Moderate',
		date: 'Sep 3rd, 2020',
		time: '2 hours',
		images: [
			'./assets/img/placeholder.jpg',
			'./assets/img/placeholder2.jpg',
			'./assets/img/placeholder3.jpg',
			'./assets/img/placeholder4.jpg',
			'./assets/img/placeholder5.jpg'
		]
	}
];

const createImgList = (arr) => {
	let list = '';
	for (let imageArr of arr) {
		const { images } = imageArr;
		for (let img of images) {
			list += `
		<div class="carousel-cell">
			<img src="${img}">
		</div>
		`;
		}
		return list;
	}
};

const renderGallery = (arr) => {
	arr.map((hike) => {
		const card = document.createElement('div');
		card.classList.add('hike-card');
		const { name, city, state, distance, difficulty, date, time } = hike;

		card.innerHTML = `
                <div class="hike-card-header">
                    <div class="hike-card-title">
                        <h4 class="hike-card-name">${name}</h4>
                        <h5 class="hike-card-location">${city}, ${state}</h5>
                    </div>
                    <div class="hike-card-date">
                        ${date}
                    </div>
                    <div class="hike-card-avatar">
					<img class="hike-card-avatar-sm" src="./assets/img/avatar.jpg">
                    </div>
                </div>
				<div class="hike-card-image">
						<div class="carousel">
							${createImgList(examples)}
						</div>
                </div>
                <div class="hike-card-footer">
                    <div class="hike-card-info">
                        <p>${distance} miles</p>
                        <p>${difficulty}</p>
                        <p>${time}</p>
                    </div>
				</div>
        `;

		gallery.appendChild(card);
	});
};

renderGallery(examples);

// Logout user
logout.addEventListener('click', (e) => {
	auth.signOut().then(() => location.reload());
});
