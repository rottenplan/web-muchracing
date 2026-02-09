
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // We can't use the model if we haven't defined it accurately for this script
    // but we can query the collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const duplicates = await usersCollection.aggregate([
        {
            $group: {
                _id: '$name',
                count: { $sum: 1 },
                emails: { $push: '$email' }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]).toArray();

    if (duplicates.length > 0) {
        console.log('⚠️ Found duplicate usernames:');
        duplicates.forEach(dup => {
            console.log(`- Username: "${dup._id}" (Count: ${dup.count})`);
            console.log(`  EMAILS: ${dup.emails.join(', ')}`);
        });
        console.log('\nAction required: Duplicates must be resolved before making "name" unique.');
    } else {
        console.log('✅ No duplicate usernames found. Safe to proceed with unique constraint.');
    }

    await mongoose.disconnect();
}

check().catch(console.error);
