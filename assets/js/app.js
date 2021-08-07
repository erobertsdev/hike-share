const gallery = document.getElementById('main'),
	navMenu = document.querySelector('.nav-menu');

let currentUser = {
		uid: 'notLoggedIn'
	},
	moreButtonAttached = false;

const renderNav = (user) => {
	if (user) {
		navMenu.innerHTML = `
			<div class="nav-menu-list">
				<ul class="nav-menu-options">
					<li class="nav-menu-account">
					<a href="./account.html">
						<img loading="lazy" class="nav-avatar" src="${user.photoURL || './assets/img/blank-avatar.png'}" />
							${user.displayName.replace(/\s.*/, '')}
						</a>
					</li>
					<li class="nav-menu-option">
						<a href="./create-post.html">Create Post</a>
					</li>
					<li class="nav-menu-option">
						<a href="#" id="logout">Log Out</a>
					</li>
				</ul>
			</div>
		`;

		// Logout user
		const logout = document.getElementById('logout');
		logout.addEventListener('click', () => {
			auth.signOut().then(() => location.reload());
		});
	} else {
		navMenu.innerHTML = `
			<div class="nav-menu-list logged-out">
				<ul class="nav-menu-options">
					<li class="nav-menu-option">
						<a href="./login.html">Login</a>
					</li>
					<li class="nav-menu-option">
						<a href="./register.html">Register</a>
					</li>
				</ul>
			</div>
		`;
	}
};

auth.onAuthStateChanged((user) => {
	if (user) {
		currentUser = user;
		renderNav(user);
	} else {
		renderNav(user);
	}
});

const createImgList = (arr) => {
	let list = '';
	const { images } = arr;
	for (let img of images) {
		list += `
		<div class="carousel-cell">
			<img loading="lazy" src="${img}">
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
	// deletes post from firebase store and images from firebase storage

	db.collection('posts').doc(postId).get().then((doc) => {
		// Map over images in post and delete from firebase storage
		let images = doc.data().images; // Images array
		images.map((img) => {
			storage.refFromURL(img).delete();
		});
		// delete post
		doc.ref.delete().then(() => location.reload()).catch((err) => {
			document.getElementById(
				`${postId}-delete`
			).innerHTML = `<div class="error">Could not delete post: ${err}</div>`;
		});
	});
};

const postComment = (postId, body) => {
	const commentsRef = db.collection('posts').doc(postId);

	commentsRef
		.update({
			comments: firebase.firestore.FieldValue.arrayUnion({
				avatarUrl: currentUser.photoURL,
				body: body,
				posted: Date.now(),
				posterId: currentUser.uid,
				posterName: currentUser.displayName
			})
		})
		.then(() => {
			location.reload();
		});
};

const renderGallery = async (startingPoint = null, searchTerms = '') => {
	let posts = [],
		remainingPostsNum;
	// get data from Firestore
	if (!startingPoint) {
		posts = await db.collection('posts').orderBy('timestamp', 'desc').limit(5).get().then((snapshot) => {
			lastVisible = snapshot.docs[snapshot.docs.length - 1];
			remainingPostsNum = snapshot.docs.length;
			return snapshot.docs;
		});
	} else {
		posts = await db
			.collection('posts')
			.orderBy('timestamp', 'desc')
			.limit(5)
			.startAfter(startingPoint)
			.get()
			.then(async (snapshot) => {
				lastVisible = snapshot.docs[snapshot.docs.length - 1];
				return snapshot.docs;
			});
	}

	if (posts.length === 0) {
		gallery.innerHTML = `<h4 class="hike-card-name">NO POSTS FOUND</h4>`;
	} else {
		// Get posts
		posts.map(async (hike) => {
			const card = document.createElement('div');
			const commentSection = document.createElement('div');
			const addComment = document.createElement('div');
			card.classList.add('hike-card');
			commentSection.classList.add('hike-card-comments');
			addComment.classList.add('add-comment');
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
				postedBy,
				comments
			} = hike.data();

			// let searchArr = [ name, city, state, country ];
			// if (searchArr.includes(searchTerms)) {
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
						<img loading="lazy" class="hike-card-avatar-sm" src=${posterAvatar} />
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

			// Retrieve info on comments and render to comments section
			if (comments.length > 0) {
				for (let comment of comments) {
					const { body, posterName, posterId, avatarUrl } = comment;
					commentSection.innerHTML += `
				<div class="comment-title">
					<img loading="lazy" class="hike-card-avatar-xs" src=${avatarUrl} />
					<div class="comment-name">${posterName}</div>
				</div>
				<div class="comment-body">${body}</div>
				<hr class="comment-hr">
				`;
					card.appendChild(commentSection);
				}
			} else {
				commentSection.innerHTML = `
				<div class="comment-name">No Comments</div>
				`;
				card.appendChild(commentSection);
			}

			addComment.innerHTML = `
			<form id="${hike.id}-comment-form">
			<textarea id="${hike.id}-textarea" class="comment" name="comment" placeholder="Add Comment (200 character max)" maxlength="200" required></textarea><br>
			<button id="${hike.id}-comment-btn" class="comment-btn">Add Comment</button>
			</form>
			`;
			if (currentUser.uid !== 'notLoggedIn') {
				commentSection.appendChild(addComment);
			}

			// HOLY SHIT THIS GOT UGLY
			// All the one million event listeners for the avatar popup, comments and deleting posts
			// AVATAR POPUPS
			document.getElementById(`${hike.id}-avatar`).addEventListener('mouseenter', () => {
				document.getElementById(`${hike.id}-popup`).classList.toggle('show');
			});
			document.getElementById(`${hike.id}-avatar`).addEventListener('mouseleave', () => {
				document.getElementById(`${hike.id}-popup`).classList.toggle('show');
			});

			// DELETE POST OPTION
			document.getElementById(`${hike.id}-delete`).addEventListener('click', () => {
				document.getElementById(`${hike.id}-delete-confirm`).classList.remove('hidden');
				document.getElementById(`${hike.id}-delete-confirm`).style.display = 'inherit';
				document.getElementById(`${hike.id}-delete-yes`).addEventListener('click', () => deletePost(hike.id));
				document.getElementById(`${hike.id}-delete-no`).addEventListener('click', () => {
					document.getElementById(`${hike.id}-delete-confirm`).classList.add('hidden');
					document.getElementById(`${hike.id}-delete-confirm`).style.display = 'none';
				});
			});

			// ADD COMMENT
			if (currentUser.uid !== 'notLoggedIn') {
				document.getElementById(`${hike.id}-comment-form`).addEventListener('submit', (e) => {
					e.preventDefault();
					let body = document.getElementById(`${hike.id}-textarea`);
					postComment(hike.id, body.value);
				});
			}

			imageCarouselEffect();
		});

		// Get number of remiaining (unrendered) posts
		remainingPostsNum = await db
			.collection('posts')
			.orderBy('timestamp', 'desc')
			.limit(5)
			.startAfter(lastVisible)
			.get()
			.then((snapshot) => {
				return snapshot.docs.length;
			});

		// Show More Button
		const more = document.createElement('div');
		more.id = 'more';
		if (remainingPostsNum > 0) {
			more.innerHTML = `
				<div id="more">
				<button id="more-btn">Show More</button>
				</div>
				`;
			// checks if event listener has already been attached to button
			// if no, adds event listener
			if (!moreButtonAttached) {
				document.getElementById('more-btn').addEventListener('click', () => {
					renderGallery(lastVisible);
				});
				moreButtonAttached = true;
			}
		} else {
			more.innerHTML = `
			<div id="more">
			<button id="more-btn">Show More</button>
			</div>
			`;
			document.getElementById('more-btn').style.display = 'none';
		}
	}
};

renderGallery();
