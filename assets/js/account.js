/* TODOS:
    Update user photoURL SOMEWHERE, SOMEHOW!!!!
*/
const accountInfoDOM = document.getElementById('account');

const renderAccountInfo = (user) => {
	if (!user) {
		accountInfoDOM.innerHTML = `You are not logged in. Please login and try again.`;
	} else {
		db.collection('users').doc(user.uid).get().then((doc) => {
			accountInfoDOM.innerHTML = `
            <h1 class="account-title">Account Overview</h1>
            <img class="account-avatar" src=${user.photoURL || '../assets/img/blank-avatar.png'} alt="avatar" />
            <p class="account-name">${doc.data().name}</p>
            <p class="account-email">${user.email}</p>
            <p class="account-created">Joined: ${user.metadata.creationTime}</p>
        `;
		});
	}
};

auth.onAuthStateChanged((user) => {
	renderAccountInfo(user);
});
