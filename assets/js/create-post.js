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

const imageUpload = (file, fileName, id) => {
	if (file.size > 15242880) {
		uploadStatus.innerHTML = `${fileName} filesize is over 15MB, cannot upload.`;
		return;
	}
	if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
		uploadStatus.innerHTML = `${fileName} invalid filetype; jpeg and png only.`;
		return;
	} else {
		const upload = storageRef.child(`${currentUser.uid}/images/${id}-${fileName}`).put(file);

		upload.on('state_changed', (snapshot) => {
			if (snapshot.state === 'running') {
				let progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
				uploadStatus.innerHTML = `UPLOADING IMAGE... ${progress}%`;
				postButton.disabled = true;
			}
		});
		upload.then((snapshot) => {
			if (snapshot.state === 'success') {
				uploadStatus.innerHTML = `IMAGES UPLOADED SUCCESSFULLY`;
				postButton.disabled = false;
				snapshot.ref.getDownloadURL().then((url) => {
					imageUrlArr.push(url);
				});
			}
		});
	}
};

const addPostToCollection = () => {
	let date = new Date();
	db
		.collection('posts')
		.add({
			postedBy: currentUser.uid,
			posterAvatar: currentUser.photoURL,
			name: createForm['name'].value,
			city: createForm['city'].value,
			postedDate: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
			state: createForm['state'].value || '',
			country: createForm['country'].value,
			distance: createForm['distance'].value,
			unit: createForm['distance-unit'].value,
			difficulty: createForm['difficulty'].value,
			duration: createForm['duration'].value,
			blurb: createForm['blurb'].value,
			timestamp: Date.now(),
			images: imageUrlArr,
			comments: []
		})
		.then(() => {
			window.location.replace('./index.html');
		})
		.catch((err) => {
			errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
		});
};

auth.onAuthStateChanged((user) => {
	if (user) {
		currentUser = user;
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
		maxFiles: 15,
		allowReorder: true,
		name: 'images',
		acceptedFileTypes: [ 'image/*' ],
		required: true,
		imageResizeTargetHeight: 400,
		checkValidity: true,
		allowImageExifOrientation: true,
		maxFileSize: '15MB',

		onupdatefiles: (files) => {
			files.map((img) => {
				if (!imagesToUploadArr.includes(img.file)) {
					imagesToUploadArr.push(img.file);
					compressImage(img.file, img.file.name, img.id);
				}
			});
		},
		onremovefile: (err, file) => {
			if (err) uploadStatus.innerHTML = `${err.message}`;
			for (let i = 0; i < imageUrlArr.length; i++) {
				if (imageUrlArr[i].includes(file.filename)) {
					storage.refFromURL(imageUrlArr[i]).delete();
					uploadStatus.innerHTML = `REMOVED ${file.filename}`;
					imageUrlArr.splice(i, 1);
				}
			}
		}
	});
