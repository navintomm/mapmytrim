const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (assuming default credentials or CLI auth)
// You might need to set GOOGLE_APPLICATION_CREDENTIALS env var if this fails
// Or use: firebase use mapmytrim
admin.initializeApp({
    projectId: 'mapmytrim',
    credential: admin.credential.applicationDefault()
});

const db = getFirestore();

async function createTestAppointment() {
    const appointment = {
        salonId: 'test_salon_id',
        salonName: 'Test Verify Salon',
        userId: 'test_user_verify',
        userName: 'Tester',
        serviceId: 'service_123',
        serviceName: 'Verification Haircut',
        date: '2025-12-25',
        time: '10:00',
        status: 'booked',
        price: 30,
        duration: 30,
        createdAt: admin.firestore.Timestamp.now(),
    };

    try {
        const docRef = await db.collection('appointments').add(appointment);
        console.log('✅ Test appointment created with ID:', docRef.id);
        console.log('This should trigger the onAppointmentCreate cloud function.');
    } catch (error) {
        console.error('❌ Error creating appointment:', error);
    }
}

createTestAppointment();
