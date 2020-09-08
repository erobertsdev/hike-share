FilePond.parse(document.body);
FilePond.registerPlugin(
	FilePondPluginImagePreview,
	FilePondPluginImageExifOrientation,
	FilePondPluginImageResize,
	FilePondPluginFileValidateSize
);

const imageUrlArr = [],
	postButton = document.querySelector('.create-btn'),
	uploadStatus = document.getElementById('upload-status'),
	imageUploadArea = document.querySelector('.create-form-images');

let imagesToUploadArr = [],
	currentUser = null;

const imageUpload = (file, id) => {
	console.log('derp');
	const upload = storageRef.child(`${currentUser.uid}/images/${id}-${file.name}`).put(file);

	upload.on('state_changed', (snapshot) => {
		if (snapshot.state === 'running') {
			let progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
			uploadStatus.innerHTML = `UPLOADING IMAGES... ${progress}%`;
			postButton.disabled = true;
		}
	});
	upload.then((snapshot) => {
		if (snapshot.state === 'success') {
			uploadStatus.innerHTML = `IMAGES UPLOADED SUCCESSFULLY`;
			postButton.disabled = false;
			snapshot.ref.getDownloadURL().then((url) => {
				imageUrlArr.push(url);
				console.log(imageUrlArr);
			});
		}
	});
};

const addPostToCollection = () => {
	db
		.collection('posts')
		.add({
			postedBy: currentUser.uid,
			posterAvatar: currentUser.photoURL,
			name: createForm['name'].value,
			city: createForm['city'].value,
			state: createForm['state'].value,
			distance: createForm['distance'].value,
			difficulty: createForm['difficulty'].value,
			duration: createForm['duration'].value,
			images: imageUrlArr
		})
		.then(() => {
			window.location.replace('../../index.html');
		})
		.catch((err) => {
			errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
		});
};

auth.onAuthStateChanged((user) => {
	if (user) {
		currentUser = user;
		console.log('authChange', currentUser);
		createForm.addEventListener('submit', (e) => {
			e.preventDefault();
			addPostToCollection();
		});
	} else {
		document.getElementById('create').innerHTML = `<h3>You are not logged in. Please login and try again.</h3>`;
	}
});

const createForm = document.getElementById('create-form'),
	errorMessage = document.getElementById('errors'),
	imageUploadElement = document.getElementById('images'),
	pond = FilePond.create(imageUploadElement, {
		maxFiles: 10,
		allowReorder: true,
		name: 'images',
		required: true,
		imageResizeTargetHeight: 400,
		checkValidity: true,
		allowImageExifOrientation: true,
		maxFileSize: '5MB',

		onupdatefiles: (files) => {
			files.map((img) => {
				if (!imagesToUploadArr.includes(img.file)) {
					imagesToUploadArr.push(img.file);
					console.log(imagesToUploadArr);
					imageUpload(img.file, img.id);
				}
			});
		},
		onremovefile: (err, file) => {
			if (err) console.log(err.message);
			console.log(file.file);
		}
	});
