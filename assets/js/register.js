// Register
const registerForm = document.getElementById('register-form'),
	errorMessage = document.getElementById('errors');

const avatarUpload = (user, file) => {
	const avatarName = `${user.uid}-avatar.${file.name.split('.')[1]}`;

	storageRef.child(`${user.uid}/images/${avatarName}`).put(file).then((snapshot) =>
		snapshot.ref.getDownloadURL().then((url) => {
			user.updateProfile({
				photoURL: url
			});
		})
	);
	window.location.replace('../../index.html');
};

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = registerForm['register-email'].value,
		password = registerForm['register-password'].value,
		confirmPassword = registerForm['register-confirm-password'].value,
		name = registerForm['register-name'].value,
		avatar = document.getElementById('avatar-upload').files[0]; // equivalent of upload.file

	if (password !== confirmPassword) {
		errors.innerHTML = `<h4 class="error-message">Passwords don't match. Please check and try again.</h4>`;
	} else {
		auth
			.createUserWithEmailAndPassword(email, password)
			.then((cred) => {
				return db.collection('users').doc(cred.user.uid).set({
					name: name
				});
			})
			.then(() => {
				if (avatar) {
					let user = firebase.auth().currentUser;
					avatarUpload(user, avatar);
				} else {
					registerForm.reset();
					window.location.replace('../../index.html');
				}
			})
			.catch((err) => {
				errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
			});
	}
});
