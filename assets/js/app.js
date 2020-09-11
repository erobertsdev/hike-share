const gallery = document.getElementById('main'),
	navMenu = document.querySelector('.nav-menu');

let currentUser = null;

const renderNav = (user) => {
	if (user) {
		console.log(user);
		navMenu.innerHTML = `
			<div class="nav-menu-list">
				<ul class="nav-menu-options">
					<li class="nav-menu-account">
					<a href="./assets/account.html">
						<img class="nav-avatar" src="${user.photoURL || '../assets/img/blank-avatar.png'}" />
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
			<div class="nav-menu-list logged-out">
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
	currentUser = user;
	renderNav(user);
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

const deletePost = (postId) => {
	// Permission is validated server side
	db
		.collection('posts')
		.doc(postId)
		.delete()
		.then(() => {
			location.reload();
		})
		.catch((err) => {
			console.log(`Error: ${err}`);
		});
};

const renderGallery = async () => {
	// get data from Firestore
	const posts = await db.collection('posts').orderBy('timestamp', 'desc').get().then((snapshot) => {
		return snapshot.docs;
	});

	if (posts.length === 0) {
		gallery.innerHTML = `<h2 class="no-posts">NO POSTS FOUND</h2>`;
	} else {
		// Get posts
		posts.map(async (hike) => {
			const card = document.createElement('div');
			card.classList.add('hike-card');
			const {
				name,
				city,
				state,
				country,
				distance,
				unit,
				difficulty,
				blurb,
				postedDate,
				duration,
				posterAvatar,
				postedBy
			} = hike.data();

			// Get info on person who made post
			const poster = await db.collection('users').doc(postedBy).get().then((doc) => {
				return doc.data();
			});

			// Info on person who made post
			const { name: posterName, experience } = poster;

			card.innerHTML = `
                <div class="hike-card-header">
                    <div class="hike-card-title">
						<h4 class="hike-card-name">${name}</h4>
						<hr class="hike-card-hr">
						<h5 class="hike-card-location"><span class="hike-card-city">${city}</span>, ${state}</h5>
						<h5 class="hike-card-country">${country}</h5>
                    </div>
                    <div class="hike-card-avatar popup" id="${hike.id}-avatar">
						<img class="hike-card-avatar-sm" src=${posterAvatar} onError="this.onerror=null;this.src='../assets/img/blank-avatar.png'" />
						<span class="avatar-info popuptext" id="${hike.id}-popup"}>
						<p class="avatar-name">${posterName}</p>
						<hr class="avatar-hr">
						<div class="avatar-stats">
						<p class="avatar-experience">Hiking Experience: ${experience}</p>
						</div>
						</span>
                    </div>
                </div>
				<div class="hike-card-image">
						<div class="carousel">
							${createImgList(hike.data())}
						</div>
                </div>
                <div class="hike-card-footer">
					<div class="hike-card-info">
						<p class="hike-card-blurb">${blurb}</p>
                        <p class="hike-card-distance"><span class="bold">Distance:</span> ${distance} ${unit}</p>
                        <p class="hike-card-difficulty"><span class="bold">Difficulty:</span> ${difficulty}</p>
						<p class="hike-card-duration"><span class="bold">Duration:</span> ${duration} ${duration > 1
				? 'hours'
				: 'hour'}</p>
						<div class="hike-card-date">
							Posted: ${postedDate}
							<br>
							${currentUser.uid === postedBy
								? `<span id="${hike.id}-delete"><i class="far fa-trash-alt"></i></span>`
								: `<span id="${hike.id}-delete"></span>`}
							<br>
							<div id="${hike.id}-delete-confirm" class="hidden">
							<p class="delete-confirm-text">Are you sure?</p>
							<button id="${hike.id}-delete-yes" class="delete-button">DELETE</button>
							<button id="${hike.id}-delete-no" class="cancel-button">CANCEL</button>
							</div>	
						</div>
                    </div>
				</div>
        `;
			gallery.appendChild(card);

			// Info popup when avatar is clicked
			// HOLY SHIT THIS GOT UGLY
			// All the one million event listeners for the avatar popup and deleting posts
			document.getElementById(`${hike.id}-avatar`).addEventListener('mouseenter', () => {
				document.getElementById(`${hike.id}-popup`).classList.toggle('show');
			});
			document.getElementById(`${hike.id}-avatar`).addEventListener('mouseleave', () => {
				document.getElementById(`${hike.id}-popup`).classList.toggle('show');
			});
			document.getElementById(`${hike.id}-delete`).addEventListener('click', () => {
				document.getElementById(`${hike.id}-delete-confirm`).classList.remove('hidden');
				document.getElementById(`${hike.id}-delete-confirm`).style.display = 'inherit';
				document.getElementById(`${hike.id}-delete-yes`).addEventListener('click', () => deletePost(hike.id));
				document.getElementById(`${hike.id}-delete-no`).addEventListener('click', () => {
					document.getElementById(`${hike.id}-delete-confirm`).classList.add('hidden');
					document.getElementById(`${hike.id}-delete-confirm`).style.display = 'none';
				});
			});
			imageCarouselEffect();
		});
	}
};

renderGallery();
