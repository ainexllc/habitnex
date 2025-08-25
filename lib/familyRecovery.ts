import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { FamilyMember } from '@/types/family';

/**
 * Recovers orphaned families by searching for families created by the user's email
 * This handles cases where the user ID might have changed between sessions
 */
export async function recoverOrphanedFamilies(userId: string, userEmail: string): Promise<boolean> {
  try {
    console.log('🔧 Starting family recovery for:', userEmail);
    
    // First, check if user already has families (no recovery needed)
    const familiesSnapshot = await getDocs(collection(db, 'families'));
    let hasExistingFamilies = false;
    
    for (const familyDoc of familiesSnapshot.docs) {
      const memberDoc = await getDoc(doc(db, 'families', familyDoc.id, 'members', userId));
      if (memberDoc.exists()) {
        hasExistingFamilies = true;
        break;
      }
    }
    
    if (hasExistingFamilies) {
      console.log('✅ User already has families, no recovery needed');
      return false;
    }
    
    // Look for orphaned families by searching all members with matching email
    console.log('🔍 Searching for orphaned families...');
    let familiesRecovered = 0;
    
    for (const familyDoc of familiesSnapshot.docs) {
      const familyData = familyDoc.data();
      
      // Get all members of this family
      const membersSnapshot = await getDocs(collection(db, 'families', familyDoc.id, 'members'));
      
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data() as FamilyMember;
        
        // Check if this member's name or any identifying info matches the user
        // We'll check multiple fields to find a match
        const memberEmail = memberData.name?.toLowerCase();
        const memberUserId = memberData.userId;
        
        // If we find a member that seems to be this user but with different ID
        if (
          (memberEmail && userEmail && memberEmail.includes(userEmail.split('@')[0].toLowerCase())) ||
          (memberData.userId && memberData.userId !== userId && memberData.role === 'parent')
        ) {
          
          // Check if this might be the same user
          if (familyData.createdBy === memberDoc.id || memberData.role === 'parent') {
            console.log(`🎯 Found potential orphaned family: ${familyData.name}`);
            console.log(`   Old member ID: ${memberDoc.id}, New user ID: ${userId}`);
            
            // Create a new member document with the current user ID
            const newMemberRef = doc(db, 'families', familyDoc.id, 'members', userId);
            
            // Copy the member data to the new ID
            await setDoc(newMemberRef, {
              ...memberData,
              userId: userId, // Update to current user ID
              recoveredAt: new Date().toISOString(),
              previousMemberId: memberDoc.id
            });
            
            console.log(`✅ Recovered family "${familyData.name}" for user`);
            familiesRecovered++;
            
            // Only recover the first family found (most likely the user's main family)
            break;
          }
        }
      }
      
      if (familiesRecovered > 0) break; // Only recover one family
    }
    
    if (familiesRecovered > 0) {
      console.log(`🎉 Successfully recovered ${familiesRecovered} family(ies)`);
      return true;
    } else {
      console.log('ℹ️ No orphaned families found to recover');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error during family recovery:', error);
    return false;
  }
}

/**
 * Alternative recovery method: Find families by invite code if user remembers it
 */
export async function recoverFamilyByInviteCode(userId: string, inviteCode: string): Promise<boolean> {
  try {
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('inviteCode', '==', inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const familyDoc = querySnapshot.docs[0];
      const familyId = familyDoc.id;
      const familyData = familyDoc.data();
      
      // Check if user is already a member
      const memberRef = doc(db, 'families', familyId, 'members', userId);
      const existingMember = await getDoc(memberRef);
      
      if (!existingMember.exists()) {
        // Add user as a recovered member
        await setDoc(memberRef, {
          familyId,
          userId,
          name: 'Recovered Member',
          displayName: 'Recovered',
          avatar: '👤',
          avatarStyle: 'personas',
          avatarSeed: null,
          color: '#3B82F6',
          role: 'adult',
          birthYear: null,
          isActive: true,
          joinedAt: new Date(),
          recoveredAt: new Date().toISOString(),
          preferences: {
            favoriteEmojis: ['⭐', '🎉', '💪'],
            difficulty: 'normal',
            motivationStyle: 'progress'
          },
          stats: {
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            habitsCompleted: 0,
            rewardsEarned: 0,
            level: 1,
            badges: [],
            lastActive: new Date()
          }
        });
        
        console.log(`✅ Recovered family "${familyData.name}" using invite code`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error recovering family by invite code:', error);
    return false;
  }
}