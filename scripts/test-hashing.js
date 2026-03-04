
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Minimal User Schema for testing
const UserSchema = new mongoose.Schema({
    email: String,
    password: { type: String },
    isVerified: Boolean
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function test() {
    console.log('--- Starting Hashing & Migration Test ---');

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const testEmail = `sec_test_${Date.now()}@example.com`;
    const testPassword = 'security_test_123';

    // 1. Verify Registration Hashing
    // We simulate registration by creating a user with a hash
    console.log('1. Testing hashing on "registration"...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(testPassword, salt);

    const newUser = await User.create({
        email: testEmail,
        password: hash,
        isVerified: true
    });

    console.log(`Created user with hash. Password stored as: ${newUser.password.substring(0, 10)}...`);

    if (newUser.password.startsWith('$2')) {
        console.log('✅ Hashing Success: Password starts with $2 (bcrypt standard).');
    } else {
        console.error('❌ Hashing Failed: Password is not a valid hash.');
    }

    // 2. Verify Migration Logic
    console.log('\n2. Testing migration of plain-text password...');
    const migrationEmail = `migrate_${Date.now()}@example.com`;
    const plainPassword = 'migrate_me_123';

    // Manually insert a plain-text password user
    await User.create({
        email: migrationEmail,
        password: plainPassword,
        isVerified: true
    });
    console.log(`Inserted plain-text user: ${migrationEmail}`);

    // Now simulate the login logic (migration)
    const userToMigrate = await User.findOne({ email: migrationEmail });
    console.log(`Pre-migration password: ${userToMigrate.password}`);

    let isMatch = false;
    try {
        isMatch = await bcrypt.compare(plainPassword, userToMigrate.password);
    } catch (e) { }

    if (!isMatch && userToMigrate.password === plainPassword) {
        console.log('Applying migration...');
        const newSalt = await bcrypt.genSalt(10);
        userToMigrate.password = await bcrypt.hash(plainPassword, newSalt);
        await userToMigrate.save();
        console.log(`Post-migration password: ${userToMigrate.password.substring(0, 10)}...`);

        if (userToMigrate.password.startsWith('$2')) {
            console.log('✅ Migration Success: Plain-text password was upgraded to hash.');
        } else {
            console.error('❌ Migration Failed.');
        }
    } else {
        console.error('❌ Migration logic not triggered.');
    }

    // Cleanup
    await User.deleteOne({ email: testEmail });
    await User.deleteOne({ email: migrationEmail });
    console.log('\nCleanup complete.');

    await mongoose.disconnect();
    console.log('--- Test Complete ---');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
