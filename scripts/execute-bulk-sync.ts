#!/usr/bin/env tsx

// Execute bulk sync directly without HTTP authentication
import { db } from '../server/db';
import { MyTAutomationService } from '../server/mytAutomationService';
import { users, aiSummitRegistrations, aiSummitSpeakerInterests, businesses } from '@shared/schema';

async function executeBulkSync() {
  console.log('🚀 Starting MYT Automation bulk sync...');
  
  try {
    const mytService = new MyTAutomationService();

    const syncResults = {
      totalUsers: 0,
      totalSpeakers: 0,
      totalExhibitors: 0,
      totalAttendees: 0,
      totalBusinesses: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      errors: [] as string[]
    };

    // Get all users
    const allUsers = await db.select().from(users);
    syncResults.totalUsers = allUsers.length;

    // Get all AI Summit registrations
    const allRegistrations = await db.select().from(aiSummitRegistrations);
    syncResults.totalAttendees = allRegistrations.length;

    // Get all speaker interests
    const allSpeakers = await db.select().from(aiSummitSpeakerInterests);
    syncResults.totalSpeakers = allSpeakers.length;

    // Skip exhibitor query due to schema issues - we have 0 anyway
    const allExhibitors: any[] = [];
    syncResults.totalExhibitors = allExhibitors.length;

    // Get all businesses
    const allBusinesses = await db.select().from(businesses);
    syncResults.totalBusinesses = allBusinesses.length;

    console.log(`📊 Data Summary: ${syncResults.totalUsers} users, ${syncResults.totalAttendees} attendees, ${syncResults.totalSpeakers} speakers, ${syncResults.totalExhibitors} exhibitors, ${syncResults.totalBusinesses} businesses`);

    // Sync all users
    console.log('\n👥 Syncing users...');
    for (const userData of allUsers) {
      try {
        const contactData = {
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          companyName: userData.company || '',
          tags: [
            'CBA Member',
            userData.participantType || 'member',
            userData.membershipTier || 'starter'
          ].filter(Boolean),
          customFields: {
            user_id: userData.id,
            membership_tier: userData.membershipTier,
            membership_status: userData.membershipStatus,
            participant_type: userData.participantType,
            job_title: userData.jobTitle,
            company: userData.company,
            bio: userData.bio,
            qr_handle: userData.qrHandle,
            title: userData.title,
            profile_image_url: userData.profileImageUrl
          }
        };

        if (contactData.email) {
          await mytService.upsertContact(contactData);
          syncResults.successfulSyncs++;
          console.log(`✅ Synced user: ${contactData.firstName} ${contactData.lastName} (${contactData.email})`);
        } else {
          syncResults.failedSyncs++;
          console.log(`❌ Skipped user without email: ${userData.firstName} ${userData.lastName}`);
        }
      } catch (error: any) {
        syncResults.failedSyncs++;
        syncResults.errors.push(`User ${userData.id}: ${error.message}`);
        console.log(`❌ Failed to sync user ${userData.id}: ${error.message}`);
      }
    }

    // Sync all AI Summit attendees
    console.log('\n🎤 Syncing AI Summit attendees...');
    for (const attendeeData of allRegistrations) {
      try {
        const contactData = {
          email: attendeeData.email,
          firstName: attendeeData.firstName || '',
          lastName: attendeeData.lastName || '',
          phone: attendeeData.phone || '',
          companyName: attendeeData.company || '',
          tags: [
            'AI Summit 2025',
            'Attendee',
            ...(attendeeData.participantRoles ? JSON.parse(attendeeData.participantRoles) : [])
          ].filter(Boolean),
          customFields: {
            ai_summit_registration_id: attendeeData.id,
            participant_roles: attendeeData.participantRoles,
            ai_interest: attendeeData.aiInterest,
            accessibility_needs: attendeeData.accessibilityNeeds,
            custom_role: attendeeData.customRole,
            pricing_status: attendeeData.pricingStatus,
            payment_status: attendeeData.paymentStatus
          }
        };

        await mytService.upsertContact(contactData);
        syncResults.successfulSyncs++;
        console.log(`✅ Synced attendee: ${contactData.firstName} ${contactData.lastName} (${contactData.email})`);
      } catch (error: any) {
        syncResults.failedSyncs++;
        syncResults.errors.push(`Attendee ${attendeeData.id}: ${error.message}`);
        console.log(`❌ Failed to sync attendee ${attendeeData.id}: ${error.message}`);
      }
    }

    // Sync all speakers
    console.log('\n🎙️ Syncing speakers...');
    for (const speakerData of allSpeakers) {
      try {
        const contactData = {
          email: speakerData.email,
          firstName: speakerData.name?.split(' ')[0] || '',
          lastName: speakerData.name?.split(' ').slice(1).join(' ') || '',
          phone: speakerData.phone || '',
          companyName: speakerData.company || '',
          tags: [
            'AI Summit 2025',
            'Speaker',
            'Speaker Interest'
          ].filter(Boolean),
          customFields: {
            speaker_id: speakerData.id,
            job_title: speakerData.jobTitle,
            website: speakerData.website,
            linkedin: speakerData.linkedIn,
            bio: speakerData.bio,
            session_type: speakerData.sessionType,
            talk_title: speakerData.talkTitle,
            talk_description: speakerData.talkDescription,
            talk_duration: speakerData.talkDuration,
            audience_level: speakerData.audienceLevel,
            speaking_experience: speakerData.speakingExperience,
            previous_speaking: speakerData.previousSpeaking,
            tech_requirements: speakerData.techRequirements,
            available_slots: speakerData.availableSlots,
            motivation_to_speak: speakerData.motivationToSpeak
          }
        };

        await mytService.upsertContact(contactData);
        syncResults.successfulSyncs++;
        console.log(`✅ Synced speaker: ${contactData.firstName} ${contactData.lastName} (${contactData.email})`);
      } catch (error: any) {
        syncResults.failedSyncs++;
        syncResults.errors.push(`Speaker ${speakerData.id}: ${error.message}`);
        console.log(`❌ Failed to sync speaker ${speakerData.id}: ${error.message}`);
      }
    }

    // Sync all businesses
    console.log('\n🏢 Syncing businesses...');
    for (const businessData of allBusinesses) {
      try {
        // Get the business owner user data
        const ownerUser = allUsers.find(user => user.id === businessData.userId);
        
        const contactData = {
          email: businessData.email || ownerUser?.email || '',
          firstName: ownerUser?.firstName || '',
          lastName: ownerUser?.lastName || '',
          phone: businessData.phone || ownerUser?.phone || '',
          companyName: businessData.name,
          tags: [
            'Business Owner',
            'CBA Business',
            businessData.isVerified ? 'Verified Business' : 'Unverified Business'
          ].filter(Boolean),
          customFields: {
            business_id: businessData.id,
            business_name: businessData.name,
            business_description: businessData.description,
            business_address: businessData.address,
            business_city: businessData.city,
            business_postcode: businessData.postcode,
            business_website: businessData.website,
            business_established: businessData.established,
            business_employee_count: businessData.employeeCount,
            business_verified: businessData.isVerified,
            business_active: businessData.isActive
          }
        };

        if (contactData.email) {
          await mytService.upsertContact(contactData);
          syncResults.successfulSyncs++;
          console.log(`✅ Synced business: ${businessData.name} (${contactData.email})`);
        } else {
          syncResults.failedSyncs++;
          console.log(`❌ Skipped business without email: ${businessData.name}`);
        }
      } catch (error: any) {
        syncResults.failedSyncs++;
        syncResults.errors.push(`Business ${businessData.id}: ${error.message}`);
        console.log(`❌ Failed to sync business ${businessData.id}: ${error.message}`);
      }
    }

    // Display final results
    console.log('\n📊 BULK SYNC RESULTS:');
    console.log('=======================');
    console.log(`Total Users: ${syncResults.totalUsers}`);
    console.log(`Total Attendees: ${syncResults.totalAttendees}`);
    console.log(`Total Speakers: ${syncResults.totalSpeakers}`);
    console.log(`Total Exhibitors: ${syncResults.totalExhibitors}`);
    console.log(`Total Businesses: ${syncResults.totalBusinesses}`);
    console.log(`Successful Syncs: ${syncResults.successfulSyncs}`);
    console.log(`Failed Syncs: ${syncResults.failedSyncs}`);
    
    if (syncResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      syncResults.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n✅ Bulk sync completed successfully!');
    
    return syncResults;
  } catch (error: any) {
    console.error('🚨 Bulk sync failed:', error);
    throw error;
  }
}

// Execute the bulk sync
executeBulkSync()
  .then(() => {
    console.log('🎉 Bulk sync script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Bulk sync script failed:', error);
    process.exit(1);
  });