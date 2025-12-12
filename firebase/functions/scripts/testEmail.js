// Test script to verify email sending
// Run: node firebase/functions/scripts/testEmail.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testEmailSystem() {
    console.log('🔍 Testing Email System...\n');

    try {
        // 1. Check recent appointments
        console.log('1️⃣ Checking recent appointments...');
        const appointmentsSnapshot = await db.collection('appointments')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (appointmentsSnapshot.empty) {
            console.log('❌ No appointments found in Firestore');
            return;
        }

        console.log(`✅ Found ${appointmentsSnapshot.size} recent appointments\n`);

        // 2. Check each appointment
        for (const doc of appointmentsSnapshot.docs) {
            const data = doc.data();
            console.log(`\n📋 Appointment: ${doc.id}`);
            console.log(`   User ID: ${data.userId}`);
            console.log(`   Salon ID: ${data.salonId}`);
            console.log(`   Service: ${data.serviceName}`);
            console.log(`   Date: ${data.date} ${data.time}`);
            console.log(`   Email Sent: ${data.confirmationEmailSent ? '✅ YES' : '❌ NO'}`);

            if (data.emailSentAt) {
                console.log(`   Email Sent At: ${data.emailSentAt.toDate()}`);
            }

            // 3. Check if user has email
            if (data.userId) {
                const userDoc = await db.collection('users').doc(data.userId).get();
                const userData = userDoc.data();

                if (userData) {
                    console.log(`   User Email: ${userData.email || '❌ MISSING'}`);
                    console.log(`   User Name: ${userData.name || 'N/A'}`);
                } else {
                    console.log(`   ❌ User document not found`);
                }
            }

            // 4. Check salon data
            if (data.salonId) {
                const salonDoc = await db.collection('salons').doc(data.salonId).get();
                const salonData = salonDoc.data();

                if (salonData) {
                    console.log(`   Salon Name: ${salonData.name}`);
                    console.log(`   Salon Address: ${salonData.address || 'N/A'}`);
                } else {
                    console.log(`   ❌ Salon document not found`);
                }
            }
        }

        console.log('\n\n📊 Summary:');
        const emailsSent = appointmentsSnapshot.docs.filter(doc => doc.data().confirmationEmailSent).length;
        console.log(`   Total Appointments: ${appointmentsSnapshot.size}`);
        console.log(`   Emails Sent: ${emailsSent}`);
        console.log(`   Emails Failed: ${appointmentsSnapshot.size - emailsSent}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

testEmailSystem();
