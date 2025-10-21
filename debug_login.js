import { UserRepository } from './src/infrastructure/repositories/UserRepository.js';

const userRepo = new UserRepository();

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...');
    
    const username = 'ahmed';
    const password = 'ahmed';
    
    console.log(`\n1. Testing validatePassword('${username}', '${password}')`);
    
    const user = await userRepo.validatePassword(username, password);
    
    if (user) {
      console.log('✅ Login successful!');
      console.log('👤 User details:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      console.log('❌ Login failed - validatePassword returned null');
    }
    
  } catch (error) {
    console.error('❌ Error during login:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

debugLogin();
