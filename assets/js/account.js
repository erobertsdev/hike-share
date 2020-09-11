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

const renderAccountInfo = (user) => {
	if (!user) {
		accountInfoDOM.innerHTML = `You are not logged in. Please login and try again.`;
	} else {
		db.collection('users').doc(user.uid).get().then((doc) => {
			accountInfoDOM.innerHTML = `
			<img class="account-avatar" src=${user.photoURL || '../assets/img/blank-avatar.png'} alt="avatar" />
            <p class="account-name">${doc.data().name}</p>
			<p class="account-email">${user.email} (Only visible to you)</p>
			<p class="account-experience">Hiking Experience: ${doc.data().experience} <i class="far fa-edit"></i></p>
            <p class="account-created">Joined: ${user.metadata.creationTime}</p>
		`;
			if (!user.displayName) {
				auth.onAuthStateChanged((user) => {
					user.updateProfile({
						displayName: doc.data().name
					});
				});
			}
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
