var firebaseConfig = {
	apiKey: 'AIzaSyAPpi-a7cVf9rWzycQ1fxyJ_A1ZJ3RqBzs',
	authDomain: 'hike-share-bfa7e.firebaseapp.com',
	databaseURL: 'https://hike-share-bfa7e.firebaseio.com',
	projectId: 'hike-share-bfa7e',
	storageBucket: 'hike-share-bfa7e.appspot.com',
	messagingSenderId: '386390011165',
	appId: '1:386390011165:web:2b95078a88c670ebc085f4',
	measurementId: 'G-SQXG4GTPL7'
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();
