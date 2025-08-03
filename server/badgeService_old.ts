import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { storage } from './storage';
import type { 
  InsertAISummitBadge, 
  AISummitBadge,
  InsertAISummitCheckIn 
} from '@shared/schema';

export interface BadgeInfo {
  badgeId: string;
  participantType: 'attendee' | 'exhibitor' | 'speaker' | 'volunteer' | 'team';
  participantId: string;
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  eventDetails: {
    eventName: string;
    eventDate: string;
    venue: string;
  };
  accessLevel?: string;
  permissions?: string[];
}

export interface CheckInResult {
  success: boolean;
  badge?: AISummitBadge;
  checkInType: 'check_in' | 'check_out';
  message: string;
  isFirstCheckIn?: boolean;
}

export class BadgeService {
  private readonly eventInfo = {
    eventName: 'First AI Summit Croydon 2025',
    eventDate: 'October 1st, 2025',
    venue: 'LSBU London South Bank University Croydon'
  };

  /**
   * Generate a unique badge ID
   */
  private generateBadgeId(): string {
    return `AIS2025-${randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
  }

  /**
   * Generate HTML for personal badge with QR handle
   */
  async generatePersonalBadgeHTML(badgeData: any): Promise<string> {
    // Generate QR code for personal badge
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(badgeData.qrCodeData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const membershipColors = {
      'Partner': '#9333EA', // Purple
      'Patron Tier': '#F59E0B', // Gold
      'Strategic Tier': '#EF4444', // Red
      'Growth Tier': '#10B981', // Green
      'Starter Tier': '#3B82F6' // Blue
    };

    const badgeColor = membershipColors[badgeData.membershipTier as keyof typeof membershipColors] || '#3B82F6';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CBA Personal Badge - ${badgeData.name}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .badge-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            border: 3px solid ${badgeColor};
        }
        
        .header {
            background: ${badgeColor};
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 25px;
        }
        
        .cba-logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .badge-type {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .qr-section {
            margin: 25px 0;
        }
        
        .qr-code {
            width: 200px;
            height: 200px;
            margin: 0 auto 15px;
            border: 3px solid ${badgeColor};
            border-radius: 15px;
            padding: 10px;
            background: white;
        }
        
        .qr-handle {
            font-size: 18px;
            font-weight: bold;
            color: ${badgeColor};
            background: rgba(59, 130, 246, 0.1);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
        }
        
        .name-section {
            margin: 20px 0;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 16px;
            color: #9333EA;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .job-title {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .company {
            font-size: 16px;
            color: #374151;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .contact-info {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        
        .badge-id {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 12px;
            margin: 20px 0;
        }
        
        .badge-id-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .badge-id-value {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            font-family: 'Courier New', monospace;
        }
        
        .footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        
        .membership-tier {
            background: ${badgeColor};
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        
        @media print {
            body { 
                background: white; 
            }
            .badge-container {
                box-shadow: none;
                border: 2px solid ${badgeColor};
            }
        }
    </style>
</head>
<body>
    <div class="badge-container">
        <div class="header">
            <div class="cba-logo">CROYDON BUSINESS ASSOCIATION</div>
            <div class="badge-type">Personal Reusable Badge</div>
        </div>
        
        <div class="qr-section">
            <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
            <div class="qr-handle">@${badgeData.qrHandle}</div>
        </div>
        
        <div class="name-section">
            <div class="name">${badgeData.name}</div>
            ${badgeData.title ? `<div class="title">👑 ${badgeData.title}</div>` : ''}
            ${badgeData.jobTitle ? `<div class="job-title">${badgeData.jobTitle}</div>` : ''}
            ${badgeData.company ? `<div class="company">🏢 ${badgeData.company}</div>` : ''}
            ${badgeData.phone ? `<div class="contact-info">📱 ${badgeData.phone}</div>` : ''}
        </div>
        
        <div class="badge-id">
            <div class="badge-id-label">Badge ID</div>
            <div class="badge-id-value">${badgeData.badgeId}</div>
        </div>
        
        <div class="membership-tier">${badgeData.membershipTier || 'Member'}</div>
        
        <div class="footer">
            <div>Reusable across all CBA events</div>
            <div>Scan QR code for digital profile</div>
            <div style="margin-top: 10px;">
                <strong>UK's Leading AI-Powered Business Association</strong><br>
                mytai.co.uk • Powered by Innovation
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for printable A4 badge
   */
  private generatePrintableBadgeHTML(badgeInfo: BadgeInfo, qrCodeDataURL: string): string {
    const typeColors = {
      attendee: '#3B82F6', // Blue
      exhibitor: '#8B5CF6', // Purple  
      speaker: '#10B981', // Green
      volunteer: '#F59E0B', // Amber
      team: '#EF4444' // Red
    };

    const typeColor = typeColors[badgeInfo.participantType] || '#6B7280';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI Summit 2025 Badge - ${badgeInfo.name}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        
        .badge-container {
            width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            border: 3px solid ${typeColor};
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            overflow: hidden;
            page-break-inside: avoid;
        }
        
        .badge-header {
            background: linear-gradient(135deg, ${typeColor}, ${typeColor}dd);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .event-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .event-date {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .participant-type {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
            display: inline-block;
        }
        
        .badge-body {
            padding: 25px;
            text-align: center;
        }
        
        .participant-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .participant-details {
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .company {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .job-title {
            font-size: 14px;
        }
        
        .qr-code {
            margin: 20px 0;
        }
        
        .qr-code img {
            width: 120px;
            height: 120px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
        }
        
        .badge-id {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 15px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        
        .venue-info {
            background: #f9fafb;
            padding: 15px;
            margin-top: 20px;
            border-radius: 8px;
            font-size: 12px;
            color: #4b5563;
        }
        
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            font-size: 14px;
            color: #92400e;
        }
        
        .instructions h3 {
            margin-top: 0;
            color: #92400e;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .instructions {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="badge-container">
        <div class="badge-header">
            <div class="event-title">First AI Summit Croydon 2025</div>
            <div class="event-date">October 1st, 2025 • LSBU Croydon</div>
            <div class="participant-type">${badgeInfo.participantType.replace('_', ' ')}</div>
        </div>
        
        <div class="badge-body">
            <div class="participant-name">${badgeInfo.name}</div>
            
            <div class="participant-details">
                ${badgeInfo.company ? `<div class="company">${badgeInfo.company}</div>` : ''}
                ${badgeInfo.jobTitle ? `<div class="job-title">${badgeInfo.jobTitle}</div>` : ''}
            </div>
            
            <div class="qr-code">
                <img src="${qrCodeDataURL}" alt="QR Code for ${badgeInfo.name}" />
            </div>
            
            <div class="badge-id">Badge ID: ${badgeInfo.badgeId}</div>
            
            <div class="venue-info">
                <strong>Venue:</strong> LSBU London South Bank University Croydon<br>
                <strong>Time:</strong> 10:00 AM - 4:00 PM<br>
                <strong>Access Level:</strong> ${badgeInfo.accessLevel || 'General Access'}
            </div>
        </div>
    </div>
    
    <div class="instructions">
        <h3>📋 Badge Instructions</h3>
        <ul>
            <li><strong>Print this badge</strong> on A4 paper (preferably white/cream colored)</li>
            <li><strong>Cut around the badge</strong> following the border lines</li>
            <li><strong>Bring this badge</strong> to the AI Summit on October 1st, 2025</li>
            <li><strong>Present at registration</strong> for quick check-in with QR code scanning</li>
            <li><strong>Wear your badge</strong> throughout the event for easy identification</li>
            <li><strong>Contact us</strong> if you have any questions: info@croydonbusiness.org</li>
        </ul>
        
        <p><strong>Important:</strong> This badge contains a unique QR code for secure event access. Please keep it safe and do not share with others.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Create a badge for any type of participant
   */
  async createBadge(participantInfo: Omit<BadgeInfo, 'badgeId' | 'eventDetails'>): Promise<AISummitBadge> {
    const badgeId = this.generateBadgeId();
    
    const badgeInfo: BadgeInfo = {
      ...participantInfo,
      badgeId,
      eventDetails: this.eventInfo
    };

    // Generate QR code data as JSON string
    const qrCodeData = JSON.stringify(badgeInfo);

    // Generate QR code as data URL for embedding in HTML
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Generate printable HTML badge
    const printableBadgeHTML = this.generatePrintableBadgeHTML(badgeInfo, qrCodeDataURL);

    // Determine badge design based on participant type
    let badgeDesign = 'standard';
    switch (participantInfo.participantType) {
      case 'speaker':
        badgeDesign = 'speaker';
        break;
      case 'exhibitor':
        badgeDesign = 'exhibitor';
        break;
      case 'volunteer':
        badgeDesign = 'volunteer';
        break;
      case 'team':
        badgeDesign = 'team';
        break;
      default:
        badgeDesign = 'standard';
    }

    const badgeData: InsertAISummitBadge = {
      badgeId,
      participantType: participantInfo.participantType,
      participantId: participantInfo.participantId,
      name: participantInfo.name,
      email: participantInfo.email,
      company: participantInfo.company || null,
      jobTitle: participantInfo.jobTitle || null,
      badgeDesign,
      qrCodeData,
      isActive: true,
      printedAt: null,
      issuedAt: new Date(),
      createdAt: new Date()
    };

    return await storage.createAISummitBadge(badgeData);
  }

  /**
   * Generate QR code image as base64 data URL
   */
  async generateQRCodeImage(badgeId: string): Promise<string> {
    const badge = await storage.getAISummitBadgeById(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    // Generate QR code with badge ID for scanning
    const qrCodeUrl = await QRCode.toDataURL(badge.badgeId, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeUrl;
  }

  /**
   * Get printable badge HTML
   */
  async getPrintableBadge(badgeId: string): Promise<string> {
    const badge = await storage.getAISummitBadgeById(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    if (!badge.printableBadgeHTML) {
      throw new Error('Printable badge not available');
    }

    return badge.printableBadgeHTML;
  }

  /**
   * Create badges for all attendees from a registration
   */
  async createAttendeeBadges(registrationId: string, attendees: any[]): Promise<AISummitBadge[]> {
    const badges: AISummitBadge[] = [];

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const badge = await this.createBadge({
        participantType: 'attendee',
        participantId: `${registrationId}-attendee-${i + 1}`,
        name: attendee.name,
        email: attendee.email,
        company: attendee.company,
        jobTitle: attendee.jobTitle
      });
      badges.push(badge);
    }

    return badges;
  }

  /**
   * Create badges for exhibitor attendees (can be both exhibitor and speaker)
   */
  async createExhibitorBadges(registrationId: string, attendees: any[], companyName: string): Promise<AISummitBadge[]> {
    const badges: AISummitBadge[] = [];

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      
      // Create exhibitor badge
      const exhibitorBadge = await this.createBadge({
        participantType: 'exhibitor',
        participantId: `${registrationId}-exhibitor-${i + 1}`,
        name: attendee.name,
        email: attendee.email,
        company: companyName,
        jobTitle: attendee.jobTitle
      });
      badges.push(exhibitorBadge);

      // If attendee is also a speaker, create speaker badge
      if (attendee.isSpeaker) {
        const speakerBadge = await this.createBadge({
          participantType: 'speaker',
          participantId: `${registrationId}-speaker-${i + 1}`,
          name: attendee.name,
          email: attendee.email,
          company: companyName,
          jobTitle: attendee.jobTitle
        });
        badges.push(speakerBadge);
      }
    }

    return badges;
  }

  /**
   * Create speaker badge
   */
  async createSpeakerBadge(speakerRegistrationId: string, speakerData: any): Promise<AISummitBadge> {
    return await this.createBadge({
      participantType: 'speaker',
      participantId: speakerRegistrationId,
      name: speakerData.name,
      email: speakerData.email,
      company: speakerData.company,
      jobTitle: speakerData.jobTitle
    });
  }

  /**
   * Create volunteer badge
   */
  async createVolunteerBadge(volunteerRegistrationId: string, volunteerData: any): Promise<AISummitBadge> {
    return await this.createBadge({
      participantType: 'volunteer',
      participantId: volunteerRegistrationId,
      name: volunteerData.name,
      email: volunteerData.email,
      jobTitle: volunteerData.role
    });
  }

  /**
   * Create team member badge
   */
  async createTeamMemberBadge(teamMemberId: string, teamMemberData: any): Promise<AISummitBadge> {
    return await this.createBadge({
      participantType: 'team',
      participantId: teamMemberId,
      name: teamMemberData.name,
      email: teamMemberData.email,
      jobTitle: teamMemberData.role,
      accessLevel: teamMemberData.accessLevel,
      permissions: teamMemberData.permissions ? JSON.parse(teamMemberData.permissions) : []
    });
  }

  /**
   * Process check-in/check-out from QR code scan
   */
  async processCheckIn(
    badgeId: string, 
    checkInType: 'check_in' | 'check_out',
    location: string = 'main_entrance',
    staffMember?: string,
    notes?: string
  ): Promise<CheckInResult> {
    try {
      // Get badge information
      const badge = await storage.getAISummitBadgeById(badgeId);
      if (!badge) {
        return {
          success: false,
          checkInType,
          message: 'Invalid badge ID. Badge not found.'
        };
      }

      if (!badge.isActive) {
        return {
          success: false,
          badge,
          checkInType,
          message: 'Badge is inactive. Please contact registration desk.'
        };
      }

      // Check if this is the first check-in for this badge
      const previousCheckIns = await storage.getCheckInsByBadgeId(badgeId);
      const isFirstCheckIn = previousCheckIns.length === 0;

      // Create check-in record
      const checkInData: InsertAISummitCheckIn = {
        badgeId,
        checkInType,
        checkInTime: new Date(),
        checkInLocation: location,
        checkInMethod: 'qr_scan',
        notes: notes || null,
        staffMember: staffMember || null
      };

      await storage.createAISummitCheckIn(checkInData);

      const actionWord = checkInType === 'check_in' ? 'checked in' : 'checked out';
      const welcomeMessage = isFirstCheckIn ? 'Welcome to the AI Summit!' : '';

      return {
        success: true,
        badge,
        checkInType,
        message: `${badge.name} successfully ${actionWord}. ${welcomeMessage}`.trim(),
        isFirstCheckIn
      };

    } catch (error) {
      console.error('Check-in processing error:', error);
      return {
        success: false,
        checkInType,
        message: 'Check-in processing failed. Please try again or contact support.'
      };
    }
  }

  /**
   * Get badge information from badge ID
   */
  async getBadgeInfo(badgeId: string): Promise<AISummitBadge | null> {
    return await storage.getAISummitBadgeById(badgeId);
  }

  /**
   * Mark badge as printed
   */
  async markBadgeAsPrinted(badgeId: string): Promise<void> {
    await storage.updateAISummitBadge(badgeId, { printedAt: new Date() });
  }

  /**
   * Deactivate a badge
   */
  async deactivateBadge(badgeId: string, reason?: string): Promise<void> {
    await storage.updateAISummitBadge(badgeId, { 
      isActive: false
    });
  }
}
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Badge color based on participant type
    const badgeColors = {
      attendee: { bg: '#3B82F6', text: '#FFFFFF' },
      exhibitor: { bg: '#8B5CF6', text: '#FFFFFF' },
      speaker: { bg: '#EF4444', text: '#FFFFFF' },
      volunteer: { bg: '#10B981', text: '#FFFFFF' },
      team: { bg: '#F59E0B', text: '#FFFFFF' }
    };

    const colors = badgeColors[badgeInfo.participantType] || badgeColors.attendee;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>AI Summit 2025 Badge - ${badgeInfo.name}</title>
      <style>
        @page { 
          size: A4; 
          margin: 20mm; 
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .badge-container {
          width: 85mm;
          height: 54mm;
          border: 2px solid #000;
          border-radius: 8px;
          background: white;
          padding: 8px;
          margin: 20px auto;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        .badge-header {
          background: ${colors.bg};
          color: ${colors.text};
          text-align: center;
          padding: 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .participant-type {
          background: ${colors.bg};
          color: ${colors.text};
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
          text-transform: uppercase;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 6px;
        }
        .name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
          text-align: center;
        }
        .details {
          font-size: 10px;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .qr-section {
          text-align: center;
          margin-top: 8px;
        }
        .qr-code {
          width: 60px;
          height: 60px;
        }
        .badge-id {
          font-size: 8px;
          text-align: center;
          margin-top: 4px;
          color: #666;
        }
        .instructions {
          max-width: 400px;
          margin: 30px auto;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }
        .instructions h3 {
          margin-top: 0;
          color: #1a73e8;
        }
        .instructions ol {
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 8px;
        }
        @media print {
          .instructions { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="badge-container">
        <div class="badge-header">
          FIRST AI SUMMIT CROYDON 2025
        </div>
        
        <div class="participant-type">
          ${badgeInfo.participantType.toUpperCase()}
        </div>
        
        <div class="name">
          ${badgeInfo.name}
        </div>
        
        <div class="details">
          ${badgeInfo.company ? `${badgeInfo.company}<br>` : ''}
          ${badgeInfo.jobTitle ? `${badgeInfo.jobTitle}<br>` : ''}
          October 1st, 2025<br>
          LSBU Croydon
        </div>
        
        <div class="qr-section">
          <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">
        </div>
        
        <div class="badge-id">
          ID: ${badgeInfo.badgeId}
        </div>
      </div>
      
      <div class="instructions">
        <h3>Badge Printing Instructions</h3>
        <ol>
          <li><strong>Print this page</strong> on A4 paper using your home or office printer</li>
          <li><strong>Cut out the badge</strong> along the border lines</li>
          <li><strong>Attach to clothing</strong> using a pin, clip, or lanyard</li>
          <li><strong>Bring to the event</strong> on October 1st, 2025</li>
          <li><strong>Present at entrance</strong> for QR code scanning and check-in</li>
        </ol>
        
        <p><strong>Important:</strong> Your QR code contains your unique registration information. Keep your badge safe and bring it to the AI Summit for entry.</p>
        
        <p><strong>Lost your badge?</strong> Contact us at info@croydonbusiness.co.uk or visit the registration desk on the day.</p>
      </div>
    </body>
    </html>`;
  }

  /**
   * Get attendee statistics
   */
  async getAttendeeStats(): Promise<any> {
    const badges = await storage.getAllAISummitBadges();
    const checkIns = await storage.getAllAISummitCheckIns();

    const stats = {
      totalBadgesIssued: badges.length,
      badgesByType: {
        attendee: badges.filter(b => b.participantType === 'attendee').length,
        exhibitor: badges.filter(b => b.participantType === 'exhibitor').length,
        speaker: badges.filter(b => b.participantType === 'speaker').length,
        volunteer: badges.filter(b => b.participantType === 'volunteer').length,
        team: badges.filter(b => b.participantType === 'team').length
      },
      currentlyCheckedIn: 0,
      totalCheckIns: checkIns.filter(c => c.checkInType === 'check_in').length,
      totalCheckOuts: checkIns.filter(c => c.checkInType === 'check_out').length
    };

    // Calculate currently checked in (check-ins minus check-outs per badge)
    const checkInCounts = new Map<string, number>();
    checkIns.forEach(checkIn => {
      const current = checkInCounts.get(checkIn.badgeId) || 0;
      checkInCounts.set(checkIn.badgeId, current + (checkIn.checkInType === 'check_in' ? 1 : -1));
    });

    stats.currentlyCheckedIn = Array.from(checkInCounts.values()).filter(count => count > 0).length;

    return stats;
  }
}

export const badgeService = new BadgeService();