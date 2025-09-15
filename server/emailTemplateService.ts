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
        templateName: "AI Summit 2025 Welcome - Registration Confirmed",
        subject: "🚀 Welcome to AI Summit 2025! Your Digital Journey Starts Now 🎯",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚀 AI Summit 2025</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Registration is Confirmed!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi {{firstName}}! 🎉</h2>
              
              <p style="color: #4b5563; font-size: 18px; line-height: 1.6;">
                <strong>Welcome to the future!</strong> Your registration for AI Summit 2025 is confirmed, and we're absolutely thrilled to have you join us for this groundbreaking event.
              </p>

              <div style="background: linear-gradient(90deg, #EBF8FF, #F0F9FF); border-left: 4px solid #3B82F6; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🗓️ Essential Event Details</h3>
                <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
                  <li><strong>📅 Date:</strong> Wednesday, October 1st, 2025</li>
                  <li><strong>⏰ Time:</strong> 10:00 AM - 4:00 PM</li>
                  <li><strong>📍 Venue:</strong> London South Bank University (LSBU) Croydon Campus</li>
                  <li><strong>🎫 Your Digital Badge ID:</strong> {{badgeId}}</li>
                  <li><strong>✉️ Your Email:</strong> {{email}}</li>
                </ul>
              </div>

              <!-- QR Code & App Instructions -->
              <div style="background: #F8FAFC; border: 2px solid #E2E8F0; padding: 25px; margin: 25px 0; border-radius: 10px;">
                <h3 style="color: #0F172A; margin-top: 0; font-size: 18px;">📱 Your High-Tech Event Experience</h3>
                <p style="color: #475569; margin: 15px 0;">
                  Get ready for a seamless, high-tech event experience! Here's how to access everything digitally:
                </p>
                <ul style="color: #475569; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>📲 Download Your QR Code:</strong> Visit <a href="https://members.croydonba.org.uk/mobile-badge" style="color: #3B82F6; text-decoration: none;">members.croydonba.org.uk/mobile-badge</a> to access your personalized digital badge</li>
                  <li><strong>🔍 QR Code Benefits:</strong> Instant check-in, networking contact exchange, session feedback, and exclusive content access</li>
                  <li><strong>📱 Event App Coming Soon:</strong> We'll send you download links 1 week before the event for real-time updates and networking</li>
                  <li><strong>💫 Smart Networking:</strong> Use your QR code to instantly connect with other attendees, speakers, and exhibitors</li>
                </ul>
                <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; color: #1E40AF; font-weight: 600;">
                    🔥 Pro Tip: Screenshot your QR code or save it to your phone's wallet for ultra-fast access!
                  </p>
                </div>
              </div>

              <!-- LSBU Entry Process -->
              <div style="background: #F0FDF4; border: 2px solid #BBF7D0; padding: 25px; margin: 25px 0; border-radius: 10px;">
                <h3 style="color: #166534; margin-top: 0; font-size: 18px;">🏢 LSBU Croydon Campus - Entry Instructions</h3>
                <p style="color: #15803D; margin: 15px 0;">
                  <strong>Address:</strong> 1 Addiscombe Rd, Croydon CR0 5AS
                </p>
                <ol style="color: #166534; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Arrival:</strong> Please arrive between 9:30-10:00 AM for smooth registration</li>
                  <li><strong>Main Reception:</strong> Enter through the main LSBU reception area</li>
                  <li><strong>Digital Check-In:</strong> Show your QR code (from your phone or printed) to our registration team</li>
                  <li><strong>Security:</strong> You may need to show photo ID alongside your digital badge</li>
                  <li><strong>Accessibility:</strong> The venue is fully accessible - contact us if you need assistance</li>
                  <li><strong>Parking:</strong> Limited on-site parking available (£5) - public transport recommended</li>
                </ol>
                <div style="background: #DCFCE7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; color: #166534; font-weight: 600;">
                    🚇 Transport: Closest stations are East Croydon (5-min walk) and Addiscombe (3-min walk)
                  </p>
                </div>
              </div>

              <!-- What You Get -->
              <div style="margin: 25px 0;">
                <h3 style="color: #1f2937; font-size: 18px;">✨ Your AI Summit 2025 Experience Includes:</h3>
                <div style="display: grid; margin: 15px 0;">
                  <ul style="color: #374151; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    <li><strong>🎤 Keynote by Jim Jordan:</strong> "How Nokia reinvented itself 5 times in 160 years" - A masterclass in resilience</li>
                    <li><strong>🧠 Interactive Keynote by Lisa Allen:</strong> "Beyond Algorithms: Cultivating Human Skills for the AI Age"</li>
                    <li><strong>🚀 Croydon StartUp CEO Presentation:</strong> Entrepreneurial ecosystems and innovation insights</li>
                    <li><strong>🛠️ Hands-on Workshops:</strong> Practical AI tools you can implement immediately</li>
                    <li><strong>👥 Structured Networking:</strong> Connect with 200+ innovators, leaders, and visionaries</li>
                    <li><strong>🍽️ Full Catering:</strong> Welcome coffee, networking lunch, and afternoon refreshments</li>
                    <li><strong>🎁 Exclusive Delegate Pack:</strong> Resources, offers, and take-home materials</li>
                    <li><strong>🎥 Session Recordings:</strong> Access to key presentations (available post-event)</li>
                  </ul>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 25px; margin: 25px 0; border-radius: 10px;">
                <h3 style="color: #92400E; margin-top: 0; font-size: 18px;">🎯 Your Next Steps (Complete by Sept 25th):</h3>
                <ol style="color: #A16207; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>📲 Get Your QR Badge:</strong> Visit <a href="https://members.croydonba.org.uk/mobile-badge" style="color: #B45309;">members.croydonba.org.uk/mobile-badge</a> and save to your phone</li>
                  <li><strong>📝 Complete Your Profile:</strong> Add your bio and interests at <a href="https://members.croydonba.org.uk/my-profile" style="color: #B45309;">members.croydonba.org.uk/my-profile</a> for better networking</li>
                  <li><strong>🧠 Prepare Questions:</strong> Think about challenges you'd like AI experts to address</li>
                  <li><strong>🤝 Set Networking Goals:</strong> What connections do you want to make? Who do you want to meet?</li>
                  <li><strong>📅 Block Your Calendar:</strong> Full day event - arrive early, stay for networking drinks</li>
                </ol>
                <div style="background: #FDE68A; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; color: #92400E; font-weight: 600;">
                    📧 Event app download link will be sent 1 week before the summit with final details!
                  </p>
                </div>
              </div>

              <!-- Contact & Support -->
              <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <h3 style="color: #0F172A; margin-top: 0;">Need Help or Have Questions?</h3>
                <p style="color: #475569; margin: 10px 0;">
                  📧 <strong>Event Support:</strong> <a href="mailto:events@croydonba.org.uk" style="color: #3B82F6;">events@croydonba.org.uk</a><br>
                  📞 <strong>WhatsApp Support:</strong> +44 7XXX XXX XXX (Available 9 AM - 6 PM)<br>
                  🌐 <strong>Event Updates:</strong> <a href="https://members.croydonba.org.uk/ai-summit" style="color: #3B82F6;">members.croydonba.org.uk/ai-summit</a>
                </p>
              </div>

              <!-- Closing -->
              <div style="text-align: center; padding: 25px 0;">
                <h3 style="color: #1f2937; margin-bottom: 15px;">🚀 Ready to Shape the Future Together?</h3>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 15px 0;">
                  This isn't just another conference - it's your opportunity to be part of Croydon's AI transformation. You'll leave with practical tools, valuable connections, and the inspiration to drive real change in your work and community.
                </p>
                <p style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 20px 0;">
                  See you on October 1st, {{firstName}}! 🎉
                </p>
                <p style="color: #6b7280; font-style: italic;">
                  <strong>Croydon Business Association</strong><br>
                  <em>Empowering Croydon to live, grow & work better</em>
                </p>
              </div>
            </div>
          </div>
        `,
        smsContent: "🚀 AI Summit 2025 confirmed! Oct 1st, LSBU Croydon, 10 AM-4 PM. Get your QR badge at members.croydonba.org.uk/mobile-badge. Badge ID: {{badgeId}}. See you there, {{firstName}}! 🎯",
        mytTags: ["attendee", "ai-summit-2025", "registered", "attendee-confirmed", "qr-enabled", "lsbu-event"],
        mytWorkflow: "ai-summit-attendee-nurture-sequence",
        variables: ["{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", "{{venue}}", "{{badgeId}}", "{{eventName}}", "{{eventDate}}"],
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