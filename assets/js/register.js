// Register
const registerForm = document.getElementById('register-form'),
	errorMessage = document.getElementById('errors');

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = registerForm['register-email'].value,
		password = registerForm['register-password'].value,
		confirmPassword = registerForm['register-confirm-password'].value,
		name = registerForm['register-name'].value,
		avatar = registerForm['register-avatar'].value;

	if (password !== confirmPassword) {
		errors.innerHTML = `<h4 class="error-message">Passwords don't match. Please check and try again.</h4>`;
	} else {
		auth
			.createUserWithEmailAndPassword(email, password)
			.then((cred) => {
				return db.collection('users').doc(cred.user.uid).set({
					name: name,
					photoURL: avatar
				});
			})
			.then(() => {
				if (avatar) {
					let user = firebase.auth().currentUser;
					user.updateProfile({
						photoURL: avatar
					});
				}
				registerForm.reset();
				window.location.replace('../../index.html');
			})
			.catch((err) => {
				errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
			});
	}
});
