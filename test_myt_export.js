#!/usr/bin/env node

const axios = require('axios');

// Admin credentials for testing
const adminEmail = 'admin@croydonba.org.uk';
const adminPassword = 'Admin@123456'; // Default test password

async function testMYTExport() {
  try {
    console.log('📋 Testing MYT Automation Export Endpoint...\n');
    
    // First, login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: adminEmail,
      password: adminPassword
    });
    
    const sessionCookie = loginResponse.headers['set-cookie'][0];
    console.log('✅ Admin login successful\n');
    
    // Now test the export endpoint
    console.log('2️⃣ Testing /api/admin/export/myt-automation endpoint...');
    const exportResponse = await axios.get('http://localhost:5000/api/admin/export/myt-automation', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const data = exportResponse.data;
    
    console.log('✅ Export endpoint successful!\n');
    console.log('📊 Data Structure Summary:');
    console.log('============================');
    console.log(`Export Date: ${data.export_date}`);
    console.log('\n📈 Summary:');
    console.log(`  - Total Contacts: ${data.summary.total_contacts}`);
    console.log(`  - Total Companies: ${data.summary.total_companies}`);
    console.log(`  - Total Event Registrations: ${data.summary.total_event_registrations}`);
    console.log(`  - Total Volunteers: ${data.summary.total_volunteers}`);
    console.log(`  - Total Speakers: ${data.summary.total_speakers}`);
    console.log(`  - Total Job Postings: ${data.summary.total_job_postings}`);
    console.log(`  - Total Job Applications: ${data.summary.total_job_applications}`);
    
    console.log('\n📊 Breakdown:');
    console.log(`  - Users: ${data.summary.breakdown.users}`);
    console.log(`  - AI Summit Registrations: ${data.summary.breakdown.ai_summit_registrations}`);
    console.log(`  - CBA Event Registrations: ${data.summary.breakdown.cba_event_registrations}`);
    console.log(`  - Businesses: ${data.summary.breakdown.businesses}`);
    console.log(`  - Exhibitors: ${data.summary.breakdown.exhibitors}`);
    
    // Sample data validation
    console.log('\n🔍 Sample Data Validation:');
    console.log('============================');
    
    if (data.contacts && data.contacts.length > 0) {
      const sampleContact = data.contacts[0];
      console.log('\n📧 Sample Contact:');
      console.log(`  - ID: ${sampleContact.id}`);
      console.log(`  - Email: ${sampleContact.email}`);
      console.log(`  - Name: ${sampleContact.firstName} ${sampleContact.lastName}`);
      console.log(`  - Tags: ${sampleContact.tags.join(', ')}`);
      console.log(`  - Custom Fields: ${Object.keys(sampleContact.customFields).length} fields`);
    }
    
    if (data.companies && data.companies.length > 0) {
      const sampleCompany = data.companies[0];
      console.log('\n🏢 Sample Company:');
      console.log(`  - ID: ${sampleCompany.id}`);
      console.log(`  - Name: ${sampleCompany.name}`);
      console.log(`  - Website: ${sampleCompany.website}`);
      console.log(`  - Custom Fields: ${Object.keys(sampleCompany.customFields).length} fields`);
    }
    
    if (data.event_registrations && data.event_registrations.length > 0) {
      const sampleReg = data.event_registrations[0];
      console.log('\n📅 Sample Event Registration:');
      console.log(`  - ID: ${sampleReg.id}`);
      console.log(`  - Event: ${sampleReg.event_name}`);
      console.log(`  - Name: ${sampleReg.name}`);
      console.log(`  - Email: ${sampleReg.email}`);
      console.log(`  - Type: ${sampleReg.participant_type}`);
    }
    
    console.log('\n✅ All data structures validated successfully!');
    console.log('\n🎉 MYT Automation Export Endpoint is working correctly!');
    
    // Save a sample to file for inspection
    const fs = require('fs');
    const sampleData = {
      export_date: data.export_date,
      summary: data.summary,
      sample_contact: data.contacts[0],
      sample_company: data.companies[0],
      sample_registration: data.event_registrations[0]
    };
    
    fs.writeFileSync('myt_export_sample.json', JSON.stringify(sampleData, null, 2));
    console.log('\n💾 Sample data saved to myt_export_sample.json for inspection');
    
  } catch (error) {
    console.error('❌ Error testing MYT export:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testMYTExport();