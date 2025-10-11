import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getDocs, collection } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }
    
    // Get all families
    const familiesSnapshot = await getDocs(collection(db, 'families'));
    const allFamilies = [];
    const userFamilies = [];
    
    for (const familyDoc of familiesSnapshot.docs) {
      const familyData = familyDoc.data();
      const familyInfo = {
        id: familyDoc.id,
        name: familyData.name,
        createdBy: familyData.createdBy,
        isActive: familyData.isActive,
        members: []
      };
      
      // Get all members of this family
      const membersSnapshot = await getDocs(collection(db, 'families', familyDoc.id, 'members'));
      const members = [];
      
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data();
        members.push({
          id: memberDoc.id,
          displayName: memberData.displayName,
          role: memberData.role,
          isActive: memberData.isActive,
          userId: memberData.userId || 'Direct member (no userId)'
        });
        
        if (memberDoc.id === userId) {
          userFamilies.push({
            familyId: familyDoc.id,
            familyName: familyData.name,
            memberData: memberData
          });
        }
      }
      
      familyInfo.members = members;
      allFamilies.push(familyInfo);
    }
    
    return NextResponse.json({
      userId,
      userFamilies,
      totalFamilies: allFamilies.length,
      allFamilies,
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Debug families error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error.message },
      { status: 500 }
    );
  }
}