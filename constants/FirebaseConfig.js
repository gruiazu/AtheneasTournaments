import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBKnHkFlsi2AAcUJnIz7M4HqPh3C5Btyf0",
    authDomain: "atheneastournaments.firebaseapp.com",
    projectId: "atheneastournaments",
    storageBucket: "atheneastournaments.firebasestorage.app",
    messagingSenderId: "383611413957",
    appId: "1:383611413957:web:90ac0f8cf9f8d7d62b57ac",
    measurementId: "G-V83KW0W9M1"
};

const app = initializeApp(firebaseConfig);
export default app;
