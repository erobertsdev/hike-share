FilePond.parse(document.body);
FilePond.registerPlugin(
	FilePondPluginImagePreview,
	FilePondPluginImageExifOrientation,
	FilePondPluginImageResize,
	FilePondPluginFileValidateSize
);

const avatarStatus = document.getElementById('avatar-status'),
	accountInfoDOM = document.getElementById('account');

let currentUser = null;

const avatarUpload = (user, file) => {
	if (file.size > 15242880) {
		avatarStatus.innerHTML = `${file.name} filesize is over 15MB, cannot upload.`;
		return;
	} else if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
		avatarStatus.innerHTML = `${file.name} invalid filetype; jpeg and png only.`;
		return;
	} else {
		const avatarName = `${user.uid}-avatar.${file.name.split('.')[1]}`;

		const upload = storageRef.child(`${user.uid}/images/${avatarName}`).put(file);

		upload.on('state_changed', (snapshot) => {
			if (snapshot.state === 'running') {
				let progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
				avatarStatus.innerHTML = `UPLOADING IMAGE... ${progress}%`;
			}
		});
		upload.then((snapshot) => {
			if (snapshot.state === 'success') {
				snapshot.ref.getDownloadURL().then((url) => {
					user
						.updateProfile({
							photoURL: url
						})
						.then(() => location.reload());
				});
			}
		});
	}
};

const deleteAccount = (userId) => {
	// Permission is validated server side
	// retrieve posts made by userId and delete
	db.collection('posts').where('postedBy', '==', userId).get().then((snapshot) => {
		snapshot.forEach((doc) => {
			// Map over images in post and delete from firebase storage
			let images = doc.data().images; // Images array
			images.map((img) => {
				storage.refFromURL(img).delete();
			});
			// delete posts made by user from firestore
			doc.ref.delete().catch((err) => {
				document.getElementById('errors').innerHTML = `Error: ${err}`;
			});
		});
	});
	// Delete account from Firestore
	db
		.collection('users')
		.doc(userId)
		.delete()
		.then(() => {
			// delete account from authentication and send to homepage
			let userToDelete = auth.currentUser;
			userToDelete.delete().then(() => window.location.replace('./index.html'));
		})
		.catch((err) => {
			document.getElementById('errors').innerHTML = `Error removing account: ${err}`;
		});
};

const renderAccountInfo = (user) => {
	if (!user) {
		accountInfoDOM.innerHTML = `You are not logged in. Please 
		<a href="./register.html">create an account</a> or <a href="./login.html">login</a>.`;
	} else {
		db.collection('users').doc(user.uid).get().then((doc) => {
			const { name, experience, id } = doc.data();

			if (!user.photoURL) {
				auth.onAuthStateChanged((user) => {
					user.updateProfile({
						photoURL:
							'https://firebasestorage.googleapis.com/v0/b/hike-share-bfa7e.appspot.com/o/blank-avatar.png?alt=media&token=da26fad1-3833-4ca4-9295-a0c421fdce7b'
					});
				});
			}

			accountInfoDOM.innerHTML = `
			<img class="account-avatar" src=${user.photoURL ||
				'https://firebasestorage.googleapis.com/v0/b/hike-share-bfa7e.appspot.com/o/blank-avatar.png?alt=media&token=da26fad1-3833-4ca4-9295-a0c421fdce7b'} alt="avatar" />
            <p class="account-name">${name}</p>
			<p class="account-email">${user.email} (Only visible to you)</p>
			<p class="account-experience">Hiking Experience: ${experience} <i class="far fa-edit"></i></p>
			<form id="edit-experience" class="hidden">
                <input type="radio" id="beginner" name="experience" value="beginner" required>
                <label for="beginner">Beginner</label><br>
                <input type="radio" id="intermediate" name="experience" value="intermediate">
                <label for="intermediate">Intermediate</label><br>
                <input type="radio" id="advanced" name="experience" value="advanced">
                <label for="advanced">Advanced</label><br>
                <input type="radio" id="expert" name="experience" value="expert">
				<label for="expert">Expert</label><br>
				<button id="update-confirm" class="delete-button">UPDATE</button>
				<button id="update-cancel" class="cancel-button">CANCEL</button>
            </form>
			<p class="account-created">Joined: ${user.metadata.creationTime}</p>
			<button id="delete-account-btn">Delete Account</button>
			<div id="delete-account" class="hidden">
			<div id="errors"></div>
			<p class="delete-confirm-text">Are you sure? This account can't be recovered.</p>
			<p class="delete-confirm-text">This also deletes all posts you've made.</p>
			<button id="delete-yes" class="delete-button">DELETE</button>
			<button id="delete-no" class="cancel-button">CANCEL</button>
		</div>
		`;
			if (!user.displayName) {
				auth.onAuthStateChanged((user) => {
					user.updateProfile({
						displayName: name
					});
				});
			}

			const updateForm = document.getElementById('edit-experience'),
				updateBtn = document.querySelector('.fa-edit'),
				updateYes = document.getElementById('update-confirm'),
				updateNo = document.getElementById('update-cancel'),
				deleteButton = document.getElementById('delete-account-btn'),
				deleteConfirm = document.getElementById('delete-account'),
				deleteYes = document.getElementById('delete-yes'),
				deleteNo = document.getElementById('delete-no');

			updateBtn.addEventListener('click', () => {
				updateForm.classList.remove('hidden');
				updateForm.style.display = 'inherit';
			});

			updateYes.addEventListener('click', (e) => {
				e.preventDefault();

				// Update hiking level
				db
					.collection('users')
					.doc(user.uid)
					.update({
						experience: updateForm['experience'].value
					})
					.then(() => location.reload());
			});

			updateNo.addEventListener('click', (e) => {
				e.preventDefault();
				// Hide update form
				updateForm.classList.add('hidden');
				updateForm.style.display = 'none';
			});

			deleteButton.addEventListener('click', () => {
				deleteConfirm.classList.remove('hidden');
				deleteConfirm.style.display = 'inherit';
			});

			deleteYes.addEventListener('click', () => deleteAccount(id));

			deleteNo.addEventListener('click', () => {
				deleteConfirm.classList.add('hidden');
				deleteConfirm.style.display = 'none';
			});
		});
	}
};

auth.onAuthStateChanged((user) => {
	currentUser = user;
	renderAccountInfo(user);
});

const avatarForm = document.getElementById('avatar-form'),
	imageUploadElement = document.getElementById('avatar-upload'),
	errorMessage = document.getElementById('errors'),
	pond = FilePond.create(imageUploadElement, {
		name: 'avatar',
		imageResizeTargetHeight: 250,
		checkValidity: true,
		allowImageExifOrientation: true,
		maxFileSize: '15MB',
		labelIdle: 'Upload/Replace Profile Image',

		onaddfile: (err, file) => {
			if (err) errorMessage.innerHTML = `${err.message}`;
			avatarUpload(currentUser, file.file);
		}
	});
