const gallery = document.getElementById('main'),
	logout = document.getElementById('logout'),
	loggedOutLinks = document.querySelectorAll('.logged-out'),
	loggedInLinks = document.querySelectorAll('.logged-in');

const renderNav = (user) => {
	if (user) {
		for (let link of loggedInLinks) {
			link.classList.remove('hidden');
		}
	} else {
		for (let link of loggedOutLinks) {
			link.classList.remove('hidden');
		}
	}
};

auth.onAuthStateChanged((user) => {
	renderNav(user);
	console.log(auth.currentUser);
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
		const { name, city, state, distance, difficulty, date, duration, posterAvatar } = hike.data();

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
					<img class="hike-card-avatar-sm" src=${posterAvatar ||
						'https://firebasestorage.googleapis.com/v0/b/hike-share-bfa7e.appspot.com/o/blank-avatar.png?alt=media&token=da26fad1-3833-4ca4-9295-a0c421fdce7b'}>
                    </div>
                </div>
				<div class="hike-card-image">
						<div class="carousel">
							${createImgList(hike.data())}
						</div>
                </div>
                <div class="hike-card-footer">
                    <div class="hike-card-info">
                        <p>${distance}</p>
                        <p>${difficulty}</p>
                        <p>${duration}</p>
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
