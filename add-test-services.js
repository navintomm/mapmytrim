// Quick script to add test services to "t cuts" salon
// Run with: node add-test-services.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestServices() {
    try {
        // Find "t cuts" salon
        const salonsSnapshot = await db.collection('salons')
            .where('name', '==', 't cuts')
            .limit(1)
            .get();

        if (salonsSnapshot.empty) {
            console.log('❌ "t cuts" salon not found');
            return;
        }

        const salonDoc = salonsSnapshot.docs[0];
        const salonId = salonDoc.id;
        console.log(`✅ Found "t cuts" salon: ${salonId}`);

        // Services to add
        const services = [
            { name: 'Haircut', durationMin: 30, price: 25 },
            { name: 'Beard Trim', durationMin: 15, price: 10 },
            { name: 'Facial', durationMin: 45, price: 40 },
            { name: 'Hair Spa', durationMin: 60, price: 50 },
            { name: 'Shave', durationMin: 20, price: 15 }
        ];

        // Add each service
        for (const service of services) {
            const serviceRef = await db
                .collection('salons')
                .doc(salonId)
                .collection('services')
                .add(service);

            console.log(`✅ Added service: ${service.name} (${serviceRef.id})`);
        }

        console.log('\n🎉 All services added successfully!');

        // Verify
        const servicesSnapshot = await db
            .collection('salons')
            .doc(salonId)
            .collection('services')
            .get();

        console.log(`\n📊 Total services in "t cuts": ${servicesSnapshot.size}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

addTestServices();
