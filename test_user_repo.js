import { UserRepository } from './src/infrastructure/repositories/UserRepository.js';

async function testUserRepo() {
  try {
    console.log('🔍 Testing UserRepository...');
    
    const userRepo = new UserRepository();
    
    // Test findByUsername
    console.log('\n1. Testing findByUsername...');
    const user = await userRepo.findByUsername('ahmed');
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
      
      // Test validatePassword
      console.log('\n2. Testing validatePassword...');
      const validatedUser = await userRepo.validatePassword('ahmed', 'ahmed');
      
      if (validatedUser) {
        console.log('✅ Password validation successful!');
        console.log('👤 Validated user:', {
          id: validatedUser.id,
          username: validatedUser.username,
          role: validatedUser.role
        });
      } else {
        console.log('❌ Password validation failed');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUserRepo();
