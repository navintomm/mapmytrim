/**
 * Database Cleanup Script
 * 
 * This script checks for existing data in Firestore and deletes it.
 * Run this to start fresh with your own data.
 * 
 * Usage: node scripts/clearDatabase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');
const { getAuth, deleteUser } = require('firebase/auth');

// Firebase config from .env.local
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndClearCollection(collectionName) {
    console.log(`\n📋 Checking ${collectionName} collection...`);

    try {
        const snapshot = await getDocs(collection(db, collectionName));

        if (snapshot.empty) {
            console.log(`✅ ${collectionName}: No data found (already empty)`);
            return 0;
        }

        console.log(`📊 Found ${snapshot.size} documents in ${collectionName}`);

        // Show sample data
        if (snapshot.size > 0) {
            const firstDoc = snapshot.docs[0].data();
            console.log(`   Sample: ${JSON.stringify(firstDoc).substring(0, 100)}...`);
        }

        // Delete all documents
        let deletedCount = 0;
        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
            deletedCount++;
        }

        console.log(`🗑️  Deleted ${deletedCount} documents from ${collectionName}`);
        return deletedCount;
    } catch (error) {
        console.error(`❌ Error with ${collectionName}:`, error.message);
        return 0;
    }
}

async function clearDatabase() {
    console.log('🚀 Starting Database Cleanup...\n');
    console.log('⚠️  This will delete ALL data from Firestore!\n');

    const collections = [
        'salons',
        'users',
        'appointments',
        'queue',
        // Add any other collections you want to clear
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
        const deleted = await checkAndClearCollection(collectionName);
        totalDeleted += deleted;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Database cleanup complete!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log('='.repeat(50));
    console.log('\n💡 You can now register your salons with fresh data!');

    process.exit(0);
}

// Run the cleanup
clearDatabase().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
