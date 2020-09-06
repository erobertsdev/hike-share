// Register
const registerForm = document.getElementById('register-form'),
	errorMessage = document.getElementById('errors');

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = registerForm['register-email'].value;
	const password = registerForm['register-password'].value;
	const confirmPassword = registerForm['register-confirm-password'].value;

	if (password !== confirmPassword) {
		errors.innerHTML = `<h4 class="error-message">Passwords don't match. Please check and try again.</h4>`;
	} else {
		auth
			.createUserWithEmailAndPassword(email, password)
			.then(() => {
				registerForm.reset();
				window.location.replace('../../index.html');
			})
			.catch((err) => {
				errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
			});
	}
});
