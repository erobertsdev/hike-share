const registerForm = document.getElementById('register-form'),
	registerBtn = document.querySelector('.register-btn'),
	errorMessage = document.getElementById('errors');

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = registerForm['register-email'].value,
		password = registerForm['register-password'].value,
		confirmPassword = registerForm['register-confirm-password'].value,
		name = registerForm['register-name'].value,
		experience = registerForm['experience'].value;

	if (password !== confirmPassword) {
		errors.innerHTML = `<h4 class="error-message">Passwords don't match. Please check and try again.</h4>`;
	} else {
		auth
			.createUserWithEmailAndPassword(email, password)
			.then((cred) => {
				return db.collection('users').doc(cred.user.uid).set({
					name,
					experience,
					id: cred.user.uid
				});
			})
			.then(() => {
				registerForm.reset();
				window.location.replace('./account.html');
			})
			.catch((err) => {
				errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
			});
	}
});
