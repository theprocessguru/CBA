#!/usr/bin/env node

// Direct email sending script for AI Summit registrants
const { db } = require('./server/db.ts');
const { aiSummitRegistrations } = require('./shared/schema.ts');
const { emailService } = require('./server/emailService.ts');
const { sql, desc } = require('drizzle-orm');

async function sendWelcomeEmails() {
  try {
    console.log('🚀 Starting AI Summit welcome email batch for registrants since Monday Sept 14th, 2025...');
    
    // Get all AI Summit registrants since Monday September 14th, 2025
    const weeklyRegistrants = await db
      .select({
        name: aiSummitRegistrations.name,
        email: aiSummitRegistrations.email,
        registeredAt: aiSummitRegistrations.registeredAt
      })
      .from(aiSummitRegistrations)
      .where(sql`DATE(${aiSummitRegistrations.registeredAt}) >= '2025-09-14'`)
      .orderBy(desc(aiSummitRegistrations.registeredAt));

    if (!weeklyRegistrants || weeklyRegistrants.length === 0) {
      console.log('❌ No AI Summit registrations found since Monday 14th');
      return;
    }

    console.log(`📧 Found ${weeklyRegistrants.length} registrants since Monday September 14th`);
    console.log('🔄 Starting email sending process with 2-second delays...\n');

    const results = [];
    let successful = 0;
    let failed = 0;
    
    // Send welcome email to each registrant
    for (let i = 0; i < weeklyRegistrants.length; i++) {
      const registrant = weeklyRegistrants[i];
      try {
        console.log(`📤 [${i + 1}/${weeklyRegistrants.length}] Sending to ${registrant.name} (${registrant.email})...`);
        
        const result = await emailService.sendWelcomeEmail(
          registrant.email,
          registrant.name,
          'attendee'
        );
        
        results.push({
          email: registrant.email,
          name: registrant.name,
          registeredAt: registrant.registeredAt,
          success: result.success,
          message: result.message
        });
        
        if (result.success) {
          successful++;
          console.log(`   ✅ Success: ${result.message}`);
        } else {
          failed++;
          console.log(`   ❌ Failed: ${result.message}`);
        }
        
        // Small delay between emails to avoid overwhelming Gmail limits
        if (i < weeklyRegistrants.length - 1) {
          console.log('   ⏳ Waiting 2 seconds before next email...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        failed++;
        results.push({
          email: registrant.email,
          name: registrant.name,
          registeredAt: registrant.registeredAt,
          success: false,
          message: error.message || 'Failed to send email'
        });
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 AI SUMMIT WELCOME EMAIL BATCH COMPLETE');
    console.log('='.repeat(60));
    console.log(`📧 Total registrants: ${weeklyRegistrants.length}`);
    console.log(`✅ Successfully sent: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success rate: ${((successful / weeklyRegistrants.length) * 100).toFixed(1)}%`);
    console.log(`📅 Date range: Since Monday September 14th, 2025`);
    
    if (failed > 0) {
      console.log('\n❌ Failed emails:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   • ${r.name} (${r.email}): ${r.message}`);
      });
    }
    
    console.log('\n🎉 Task completed successfully!');
    
    return {
      success: true,
      totalRegistrants: weeklyRegistrants.length,
      successful,
      failed,
      dateRange: "Since Monday September 14th, 2025",
      registrants: weeklyRegistrants.map(r => ({ 
        name: r.name, 
        email: r.email, 
        registeredAt: r.registeredAt 
      })),
      results
    };

  } catch (error) {
    console.error('💥 Error sending weekly AI Summit welcome emails:', error);
    throw error;
  }
}

// Run the script
sendWelcomeEmails()
  .then(result => {
    console.log('\n✨ Script execution completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Script execution failed:', error);
    process.exit(1);
  });