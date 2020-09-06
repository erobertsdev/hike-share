// Register
const registerForm = document.getElementById('register-form'),
	errors = document.getElementById('register-errors');

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = registerForm['register-email'].value;
	const password = registerForm['register-password'].value;
	const confirmPassword = registerForm['register-confirm-password'].value;

	if (password !== confirmPassword) {
		errors.innerHTML = `PASSWORDS DON'T MATCH, DUMBO`;
	} else {
		auth
			.createUserWithEmailAndPassword(email, password)
			.catch((err) => {
				errors.innerHTML = `Error: ${err.message}`;
			})
			.then((cred) => {
				console.log(cred);
				registerForm.reset();
				window.location.replace('../../index.html');
			});
	}
});
