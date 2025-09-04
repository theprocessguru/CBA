import { db } from "./db";
import { emailTemplates } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class EmailTemplateService {
  // Get email template for a specific person type
  async getTemplate(personType: string) {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.personType, personType),
          eq(emailTemplates.isActive, true)
        )
      )
      .limit(1);
    
    return template;
  }

  // Initialize default templates if none exist
  async initializeDefaultTemplates() {
    const existingTemplates = await db.select().from(emailTemplates);
    
    if (existingTemplates.length > 0) {
      return; // Templates already exist
    }

    const defaultTemplates = [
      {
        personType: "volunteer",
        templateName: "Volunteer Welcome Email",
        subject: "Welcome to the CBA Volunteer Team! 🌟",
        htmlContent: `
          <h2>Welcome {{firstName}}!</h2>
          <p>Thank you for joining our volunteer community at the Croydon Business Association!</p>
          
          <h3>As a Volunteer, you get access to:</h3>
          <ul>
            <li>📱 Your personalized digital volunteer badge</li>
            <li>🎯 Priority event access and special volunteer-only sessions</li>
            <li>📚 Free training workshops and skill development programs</li>
            <li>🏆 Recognition awards and certificates</li>
            <li>🤝 Networking opportunities with business leaders</li>
            <li>💼 Job opportunities and career mentoring</li>
          </ul>
          
          <h3>Your Next Steps:</h3>
          <ol>
            <li>Access your volunteer dashboard at /dashboard</li>
            <li>Download your digital badge at /mobile-badge</li>
            <li>Join our volunteer WhatsApp group (link in dashboard)</li>
            <li>Sign up for your first volunteer shift</li>
            <li>Complete your volunteer profile for better opportunities</li>
          </ol>
          
          <p>We're excited to have you make a difference in our community!</p>
          <p>Need help? Contact our Volunteer Coordinator at volunteers@croydonba.org.uk</p>
        `,
        smsContent: "Welcome {{firstName}}! You're now part of the CBA Volunteer Team. Access your dashboard to get started and download your volunteer badge. We're excited to have you!",
        mytTags: ["volunteer", "ai-summit-2025", "onboarded", "volunteer-active"],
        mytWorkflow: "volunteer-onboarding-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", "{{company}}"],
        isActive: true
      },
      {
        personType: "vip",
        templateName: "VIP Welcome Email",
        subject: "VIP Welcome - Exclusive Access to Croydon Business Association",
        htmlContent: `
          <h2>Welcome {{fullName}}</h2>
          <p>We're honored to have you as a VIP member of the Croydon Business Association.</p>
          
          <h3>Your VIP Benefits Include:</h3>
          <ul>
            <li>🎖️ VIP digital badge with priority access</li>
            <li>🥇 Reserved seating at all events</li>
            <li>🍾 Access to VIP lounge and hospitality</li>
            <li>📞 Direct line to executive team</li>
            <li>🎯 Invitation to exclusive VIP-only events</li>
            <li>🚗 Complimentary parking at venues</li>
            <li>💼 Priority business matching services</li>
          </ul>
          
          <h3>Your VIP Concierge Service:</h3>
          <p>Your dedicated VIP coordinator will contact you within 24 hours to:</p>
          <ul>
            <li>Schedule a personal welcome meeting</li>
            <li>Understand your business needs</li>
            <li>Arrange introductions to key stakeholders</li>
            <li>Customize your membership experience</li>
          </ul>
          
          <p>VIP Hotline: 020 1234 5678 (9am-9pm, 7 days)</p>
          <p>VIP Email: vip@croydonba.org.uk</p>
        `,
        smsContent: "Welcome {{fullName}}! Your VIP membership is active. Your dedicated coordinator will contact you within 24 hours. VIP Hotline: 020 1234 5678",
        mytTags: ["vip", "ai-summit-2025", "onboarded", "vip-active", "priority-support"],
        mytWorkflow: "vip-concierge-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", "{{company}}"],
        isActive: true
      },
      {
        personType: "speaker",
        templateName: "Speaker Welcome Email",
        subject: "Speaker Welcome - AI Summit 2025 🎤",
        htmlContent: `
          <h2>Welcome {{fullName}}!</h2>
          <p>Thank you for joining us as a speaker at the AI Summit 2025!</p>
          
          <h3>Speaker Resources & Benefits:</h3>
          <ul>
            <li>🎤 Your official speaker badge and credentials</li>
            <li>📊 Access to speaker resource portal</li>
            <li>🎥 Professional recording of your session</li>
            <li>📸 Professional photography during your talk</li>
            <li>🎁 Complimentary VIP access to all summit events</li>
            <li>🍽️ Speaker dinner invitation (March 27th)</li>
            <li>🚗 Reserved parking at the venue</li>
          </ul>
          
          <h3>Important Deadlines:</h3>
          <ul>
            <li>📝 Submit presentation slides by March 15th</li>
            <li>📋 Complete tech check by March 20th</li>
            <li>🎙️ Speaker briefing call on March 25th</li>
          </ul>
          
          <p>Your speaker coordinator will contact you shortly with detailed information about your session.</p>
          <p>Speaker Support: speakers@croydonba.org.uk</p>
        `,
        smsContent: "Welcome {{fullName}}! You're confirmed as a speaker for AI Summit 2025. Check your email for important deadlines and resources. We're excited to have you!",
        mytTags: ["speaker", "ai-summit-2025", "onboarded", "speaker-confirmed"],
        mytWorkflow: "speaker-preparation-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", "{{company}}"],
        isActive: true
      },
      {
        personType: "exhibitor",
        templateName: "Exhibitor Welcome Email",
        subject: "Exhibitor Welcome - AI Summit 2025 🏢",
        htmlContent: `
          <h2>Welcome {{company}}!</h2>
          <p>Thank you for exhibiting at the AI Summit 2025! We're excited to have you showcase your innovations.</p>
          
          <h3>Your Exhibitor Package Includes:</h3>
          <ul>
            <li>🏢 {{standSize}} exhibition stand at {{standLocation}}</li>
            <li>🎫 {{exhibitorPasses}} exhibitor passes</li>
            <li>📱 Lead scanning app access</li>
            <li>📢 Company listing in event programme</li>
            <li>🎯 Pre-event attendee matching service</li>
            <li>📦 Furniture package and power supply</li>
            <li>🍽️ Catering for your team</li>
          </ul>
          
          <h3>Key Dates:</h3>
          <ul>
            <li>📅 Setup: March 27th, 2-6pm</li>
            <li>🎪 Exhibition: March 28th, 9am-6pm</li>
            <li>📦 Breakdown: March 28th, 6-8pm</li>
          </ul>
          
          <p>Your exhibitor coordinator will send detailed setup instructions and floor plans.</p>
          <p>Exhibitor Support: exhibitors@croydonba.org.uk</p>
        `,
        smsContent: "Welcome {{company}}! Your exhibition stand for AI Summit 2025 is confirmed. Setup begins March 27th, 2pm. Check email for full details.",
        mytTags: ["exhibitor", "ai-summit-2025", "onboarded", "exhibitor-confirmed"],
        mytWorkflow: "exhibitor-onboarding-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{company}}", "{{standSize}}", "{{standLocation}}", "{{exhibitorPasses}}"],
        isActive: true
      },
      {
        personType: "sponsor",
        templateName: "Sponsor Welcome Email",
        subject: "Sponsor Welcome - Thank You for Supporting AI Summit 2025 🌟",
        htmlContent: `
          <h2>Welcome {{company}}!</h2>
          <p>Thank you for sponsoring the AI Summit 2025! Your support makes this event possible.</p>
          
          <h3>Your {{sponsorshipLevel}} Sponsorship Benefits:</h3>
          <ul>
            <li>🎯 Premium brand visibility throughout the event</li>
            <li>🎤 {{speakingSlots}} speaking opportunity</li>
            <li>🏢 {{boothSize}} premium exhibition space</li>
            <li>🎫 {{delegatePasses}} delegate passes</li>
            <li>📢 Logo on all marketing materials</li>
            <li>📧 Access to attendee list (GDPR compliant)</li>
            <li>🎥 Sponsored session recording rights</li>
            <li>🍾 VIP dinner invitation for {{vipDinnerSeats}} guests</li>
          </ul>
          
          <h3>Marketing Opportunities:</h3>
          <ul>
            <li>Social media co-promotion</li>
            <li>Press release announcement</li>
            <li>Website feature article</li>
            <li>Event app banner placement</li>
          </ul>
          
          <p>Your dedicated sponsor manager will contact you within 24 hours to discuss activation opportunities.</p>
          <p>Sponsor Relations: sponsors@croydonba.org.uk | Direct: 020 9876 5432</p>
        `,
        smsContent: "Welcome {{company}}! Thank you for your {{sponsorshipLevel}} sponsorship of AI Summit 2025. Your sponsor manager will contact you shortly.",
        mytTags: ["sponsor", "ai-summit-2025", "onboarded", "sponsor-confirmed"],
        mytWorkflow: "sponsor-activation-sequence",
        variables: ["{{company}}", "{{sponsorshipLevel}}", "{{speakingSlots}}", "{{boothSize}}", "{{delegatePasses}}", "{{vipDinnerSeats}}"],
        isActive: true
      },
      {
        personType: "attendee",
        templateName: "Attendee Welcome Email",
        subject: "Welcome to AI Summit 2025! Your Registration is Confirmed 🎯",
        htmlContent: `
          <h2>Hi {{firstName}}!</h2>
          <p>Your registration for AI Summit 2025 is confirmed! Get ready for an incredible day of AI innovation and networking.</p>
          
          <h3>Event Details:</h3>
          <ul>
            <li>📅 Date: March 28, 2025</li>
            <li>⏰ Time: 9:00 AM - 6:00 PM</li>
            <li>📍 Venue: {{venue}}</li>
            <li>🎫 Your Badge ID: {{badgeId}}</li>
          </ul>
          
          <h3>What You Get:</h3>
          <ul>
            <li>✅ Full day conference access</li>
            <li>🎤 20+ expert speakers</li>
            <li>🏢 50+ exhibitors showcase</li>
            <li>🤝 Structured networking sessions</li>
            <li>☕ Refreshments and lunch included</li>
            <li>📱 Event app with attendee matching</li>
            <li>🎁 Delegate pack with exclusive offers</li>
          </ul>
          
          <h3>Prepare for the Event:</h3>
          <ol>
            <li>Download the event app (link coming soon)</li>
            <li>Browse the agenda and plan your day</li>
            <li>Book 1-2-1 meetings with other attendees</li>
            <li>Prepare questions for Q&A sessions</li>
          </ol>
          
          <p>Need assistance? Contact us at events@croydonba.org.uk</p>
          <p>See you at the summit!</p>
        `,
        smsContent: "Hi {{firstName}}! You're registered for AI Summit 2025 on March 28. Badge ID: {{badgeId}}. Check your email for full details. See you there!",
        mytTags: ["attendee", "ai-summit-2025", "registered", "attendee-confirmed"],
        mytWorkflow: "attendee-nurture-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{venue}}", "{{badgeId}}"],
        isActive: true
      },
      {
        personType: "adhoc",
        templateName: "Ad Hoc Email",
        subject: "🌐 Welcome to the AI Summit 2025 – Hosted by Croydon Business Association 🌐",
        htmlContent: `
          <h2>Dear {{firstName}},</h2>
          
          <p>Your registration for the <strong>AI Summit 2025</strong> is confirmed! Join us on <strong>Wednesday, 1st October at LSBU Croydon (10:00 AM – 4:00 PM)</strong> for a day of discovery, collaboration, and impact.</p>
          
          <p>You'll be in the room with leaders shaping the future of AI—including the <strong>UK AI Minister, Mayor Jason Perry, MP Sarah Jones,</strong> and industry experts.</p>
          
          <h3>✨ Here's what's waiting for you:</h3>
          <ul>
            <li><strong>Jim Jordan</strong> – Keynote on How Nokia reinvented itself 5 times in 160 years — a masterclass in resilience and reinvention.</li>
            <li><strong>Lisa Allen</strong> – Beyond Algorithms: Cultivating Human Skills for the AI Age — a thought-provoking interactive keynote on the human side of AI.</li>
            <li><strong>Saffron Saunders, CEO of Croydon StartUp</strong> – Keynote on entrepreneurial ecosystems and innovation.</li>
            <li><strong>Croydon StartUp Workshop</strong> – A hands-on session equipping you with practical tools and strategies to accelerate your business growth.</li>
            <li>Hands-on workshops with AI practitioners to give you real skills you can apply right away.</li>
            <li>Networking with innovators and leaders across Croydon and beyond.</li>
          </ul>
          
          <h3>⚡ Why it matters:</h3>
          <p>This summit is part of the Croydon Business Association's mission to transform Croydon into a better place to live, grow, and work—through powerful events, networking opportunities, and workshops at Zodiac Court and beyond.</p>
          
          <h3>📍 Event Details</h3>
          <p>
            <strong>Date:</strong> Wednesday, 1st October 2025<br>
            <strong>Time:</strong> 10:00 AM – 4:00 PM<br>
            <strong>Location:</strong> LSBU Croydon
          </p>
          
          <p>We're excited to welcome you on October 1st. Together, let's learn, grow, and collaborate to shape Croydon's future.</p>
          
          <p><strong>Warm regards,</strong><br>
          <strong>Croydon Business Association</strong><br>
          <em>Empowering Croydon to live, grow & work better</em></p>
        `,
        smsContent: "🌐 AI Summit 2025 confirmed! October 1st, LSBU Croydon, 10 AM-4 PM. See you there, {{firstName}}!",
        mytTags: ["ai-summit-2025", "confirmed", "adhoc"],
        mytWorkflow: "ai-summit-reminder-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", "{{company}}"],
        isActive: true
      }
    ];

    // Insert default templates
    await db.insert(emailTemplates).values(defaultTemplates);
  }

  // Replace variables in template content
  replaceVariables(content: string, data: Record<string, any>): string {
    let result = content;
    
    // Replace each variable with actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });
    
    return result;
  }
}