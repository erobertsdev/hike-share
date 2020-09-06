const gallery = document.getElementById('main'),
	logout = document.getElementById('logout');

auth.onAuthStateChanged((user) => {
	if (user) {
		console.log('User is logged in', user);
	} else {
		console.log('User logged out.');
	}
});

const createImgList = (arr) => {
	let list = '';
	const { images } = arr;
	for (let img of images) {
		list += `
		<div class="carousel-cell">
			<img src="${img}">
		</div>
		`;
	}
	return list;
};

const imageCarouselEffect = () => {
	let carousel = document.querySelectorAll('.carousel');
	for (let post of carousel) {
		let flkty = new Flickity(post, {
			imagesLoaded: true,
			percentPosition: false
		});
		let imgs = post.querySelectorAll('.carousel-cell img');
		let docStyle = document.documentElement.style;
		let transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';

		flkty.on('scroll', function() {
			flkty.slides.forEach(function(slide, i) {
				let img = imgs[i];
				let x = (slide.target + flkty.x) * -1 / 3;
				img.style[transformProp] = 'translateX(' + x + 'px)';
			});
		});
	}
};

const renderGallery = async (arr) => {
	// get data from Firestore
	const posts = await db.collection('posts').get().then((snapshot) => {
		return snapshot.docs;
	});

	posts.map((hike) => {
		const card = document.createElement('div');
		card.classList.add('hike-card');
		const { name, city, state, distance, difficulty, date, time } = hike.data();

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
							${createImgList(hike.data())}
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
	imageCarouselEffect();
};

renderGallery();

// Logout user
logout.addEventListener('click', (e) => {
	auth.signOut().then(() => location.reload());
});
