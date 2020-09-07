const createForm = document.getElementById('create-form'),
	errorMessage = document.getElementById('errors');

auth.onAuthStateChanged(function(user) {
	if (user) {
		createForm.addEventListener('submit', (e) => {
			e.preventDefault();

			db
				.collection('posts')
				.add({
					postedBy: user.uid,
					posterAvatar: user.photoURL,
					name: createForm['name'].value,
					city: createForm['city'].value,
					state: createForm['state'].value,
					distance: createForm['distance'].value,
					difficulty: createForm['difficulty'].value,
					duration: createForm['duration'].value,
					images: [
						'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
						'https://images.unsplash.com/photo-1455305049585-41b8d277d68a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
						'https://images.unsplash.com/photo-1455247103547-c22cb822c89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
						'https://images.unsplash.com/photo-1455305049585-41b8d277d68a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
						'https://images.unsplash.com/photo-1465843634867-5ff22f695d11?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
					]
				})
				.then(() => {
					window.location.replace('../../index.html');
				})
				.catch((err) => {
					errorMessage.innerHTML = `<h4 class="error-message">${err.message}</h4>`;
				});
		});
	} else {
		document.getElementById('create').innerHTML = `<h3>You are not logged in. Please login and try again.</h3>`;
	}
});
