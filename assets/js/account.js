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
				user.updateProfile({
					photoURL: url
				});
				location.reload();
			});
		}
	});
};

const deleteAccount = (userId) => {
	// Permission is validated server side
	db
		.collection('users')
		.doc(userId)
		.delete()
		.then(() => {
			location.reload();
		})
		.catch((err) => {
			document.getElementById('errors').innerHTML = `Error removing account: ${err}`;
		});
};

const renderAccountInfo = (user) => {
	if (!user) {
		accountInfoDOM.innerHTML = `You are not logged in. Please 
		<a href="../register.html">create an account</a> or <a href="../login.html">login</a>.`;
	} else {
		db.collection('users').doc(user.uid).get().then((doc) => {
			const { name, experience, id } = doc.data();

			accountInfoDOM.innerHTML = `
			<img class="account-avatar" src=${user.photoURL || '../assets/img/blank-avatar.png'} alt="avatar" />
            <p class="account-name">${name}</p>
			<p class="account-email">${user.email} (Only visible to you)</p>
			<p class="account-experience">Hiking Experience: ${experience} <i class="far fa-edit"></i></p>
			<p class="account-created">Joined: ${user.metadata.creationTime}</p>
			<button id="delete-account-btn">Delete Account</button>
			<div id="delete-account" class="hidden">
			<div id="errors"></div>
			<p class="delete-confirm-text">Are you sure? This account can't be recovered.</p>
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

			const deleteButton = document.getElementById('delete-account-btn'),
				deleteConfirm = document.getElementById('delete-account'),
				deleteYes = document.getElementById('delete-yes'),
				deleteNo = document.getElementById('delete-no');

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
		maxFileSize: '5MB',
		labelIdle: 'Upload/Replace Profile Image',

		onaddfile: (err, file) => {
			if (err) errorMessage.innerHTML = `${err.message}`;
			avatarUpload(currentUser, file.file);
		}
	});
