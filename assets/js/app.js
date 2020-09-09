// replace(/\s.*/, '') -- first name

const gallery = document.getElementById('main'),
	navMenu = document.querySelector('.nav-menu');
// loggedOutLinks = document.querySelectorAll('.logged-out'),
// loggedInLinks = document.querySelectorAll('.logged-in');

const renderNav = (user) => {
	if (user) {
		console.log(user);
		navMenu.innerHTML = `
			<div class="nav-menu-list">
				<ul class="nav-menu-options">
					<li class="nav-menu-account">
					<a href="./assets/account.html">
						<img class="nav-avatar" src="${user.photoURL ||
							'https://firebasestorage.googleapis.com/v0/b/hike-share-bfa7e.appspot.com/o/blank-avatar.png?alt=media&token=da26fad1-3833-4ca4-9295-a0c421fdce7b'}" /><br>
							${user.displayName.replace(/\s.*/, '')}
						</a>
					</li>
					<li class="nav-menu-option">
						<a href="./assets/create-post.html">Create Post</a>
					</li>
					<li class="nav-menu-option">
						<a href="#" id="logout">Log Out</a>
					</li>
				</ul>
			</div>
		`;

		// Logout user
		const logout = document.getElementById('logout');
		logout.addEventListener('click', (e) => {
			auth.signOut().then(() => location.reload());
		});
	} else {
		navMenu.innerHTML = `
			<div class="nav-menu-list">
                    <ul class="nav-menu-options">
                        <li class="nav-menu-option">
                            <a href="./assets/login.html">Login</a>
                        </li>
                        <li class="nav-menu-option">
                            <a href="./assets/register.html">Register</a>
                        </li>
                    </ul>
                </div>
		`;
	}
};

auth.onAuthStateChanged((user) => {
	db.collection('users').doc(user.uid).get().then((doc) => {
		console.log(doc.data().name);
		user.updateProfile({
			displayName: doc.data().name
		});
	}),
		renderNav(user),
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
		const { name, city, state, distance, unit, difficulty, postedDate, duration, posterAvatar } = hike.data();

		card.innerHTML = `
                <div class="hike-card-header">
                    <div class="hike-card-title">
                        <h4 class="hike-card-name">${name}</h4>
                        <h5 class="hike-card-location"><span class="hike-card-city">${city}</span>, ${state}</h5>
                    </div>
                    <div class="hike-card-date">
                        ${postedDate}
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
                        <p class="hike-card-distance">${distance} ${unit}</p>
                        <p class="hike-card-difficulty">${difficulty}</p>
                        <p class="hike-card-duration">${duration} hours</p>
                    </div>
				</div>
        `;

		gallery.appendChild(card);
	});
	imageCarouselEffect();
};

renderGallery();
