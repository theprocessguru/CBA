// Script to send welcome emails to today's AI Summit registrants
import { db } from './server/db.js';
import { aiSummitRegistrations } from './shared/schema.js';
import { emailService } from './server/emailService.js';
import { sql, desc } from 'drizzle-orm';

async function sendTodaysWelcomeEmails() {
  try {
    console.log('🚀 Starting welcome email send for today\'s AI Summit registrants...');
    
    // Get today's AI Summit registrants
    const todayRegistrants = await db
      .select({
        name: aiSummitRegistrations.name,
        email: aiSummitRegistrations.email,
        registeredAt: aiSummitRegistrations.registeredAt
      })
      .from(aiSummitRegistrations)
      .where(sql`DATE(${aiSummitRegistrations.registeredAt}) = CURRENT_DATE`)
      .orderBy(desc(aiSummitRegistrations.registeredAt));

    if (!todayRegistrants || todayRegistrants.length === 0) {
      console.log('❌ No AI Summit registrations found for today');
      return;
    }

    console.log(`📧 Found ${todayRegistrants.length} registrants from today:`);
    todayRegistrants.forEach(r => {
      console.log(`   - ${r.name} (${r.email}) - ${r.registeredAt}`);
    });

    const results = [];
    
    // Send welcome email to each registrant
    for (const registrant of todayRegistrants) {
      try {
        console.log(`\n📬 Sending welcome email to ${registrant.name} (${registrant.email})...`);
        
        const result = await emailService.sendWelcomeEmail(
          registrant.email,
          registrant.name,
          'attendee'
        );
        
        results.push({
          email: registrant.email,
          name: registrant.name,
          success: result.success,
          message: result.message
        });
        
        if (result.success) {
          console.log(`   ✅ Welcome email sent successfully!`);
        } else {
          console.log(`   ❌ Failed: ${result.message}`);
        }
        
        // Small delay between emails to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`   ❌ Error sending to ${registrant.email}:`, error.message);
        results.push({
          email: registrant.email,
          name: registrant.name,
          success: false,
          message: error.message || 'Failed to send email'
        });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Successfully sent: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📧 Total registrants: ${todayRegistrants.length}`);

    if (failed > 0) {
      console.log('\n❌ Failed emails:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name} (${r.email}): ${r.message}`);
      });
    }

    console.log('\n🎉 Welcome email sending complete!');
    
  } catch (error) {
    console.error('💥 Error in welcome email script:', error);
  }
}

// Run the script
sendTodaysWelcomeEmails()
  .then(() => {
    console.log('\n✨ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });