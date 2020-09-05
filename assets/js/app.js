const gallery = document.getElementById('main');

const examples = [
	{
		name: 'Pino Trail',
		city: 'Albuquerque',
		state: 'NM',
		distance: 7.1,
		difficulty: 'Hard',
		date: 'Sep 1st, 2020',
		time: '4 hours',
		thumb: 'assets/img/placeholder.jpg'
	},
	{
		name: 'La Luz Trail',
		city: 'Albuquerque',
		state: 'NM',
		distance: 13.1,
		difficulty: 'Difficult',
		date: 'Sep 2nd, 2020',
		time: '6.5 hours',
		thumb: 'assets/img/placeholder.jpg'
	},
	{
		name: 'Piedra Lisa',
		city: 'Albuquerque',
		state: 'NM',
		distance: 3.5,
		difficulty: 'Moderate',
		date: 'Sep 3rd, 2020',
		time: '2 hours',
		thumb: 'assets/img/placeholder.jpg'
	}
];

const renderGallery = (arr) => {
	arr.map((hike) => {
		const card = document.createElement('div');
		card.classList.add('hike-card');
		const { name, city, state, distance, difficulty, date, time, thumb } = hike;

		card.innerHTML = `
                <div class="hike-card-header">
                    <div class="hike-card-title">
                        <h4>${name}</h4>
                        <h5>${city}, ${state}</h5>
                    </div>
                    <div class="hike-card-date">
                        ${date}
                    </div>
                    <div class="hike-card-avatar">
                        AVATAR
                    </div>
                </div>
				<div class="hike-card-image">
						<div class="carousel">
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
							<div class="carousel-cell">
								<img class="hike-card-img" src="./assets/img/placeholder.jpg">
							</div>
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
