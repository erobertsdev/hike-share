const loginForm = document.getElementById('login-form'),
	errorMessage = document.getElementById('errors');

loginForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const email = loginForm['login-email'].value;
	const password = loginForm['login-password'].value;

	auth
		.signInWithEmailAndPassword(email, password)
		.then((cred) => {
			loginForm.reset();
			window.location.replace('./index.html');
		})
		.catch((err) => {
			errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
		});
});
