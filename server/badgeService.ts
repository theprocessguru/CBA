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
    // Generate QR code for personal badge - use qrHandle for scanning compatibility
    const qrCodeData = badgeData.qrCodeData.qrHandle || badgeData.qrHandle || JSON.stringify(badgeData.qrCodeData);
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
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
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            margin-top: 10px;
        }
        
        .badge-body {
            padding: 30px;
            text-align: center;
        }
        
        .participant-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
        }
        
        .participant-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        
        .qr-section {
            margin: 20px 0;
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
            border: 2px solid ${typeColor};
            border-radius: 10px;
            padding: 10px;
            background: white;
        }
        
        .badge-id {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 10px;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            font-family: 'Courier New', monospace;
        }
        
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.5;
            color: #666;
        }
        
        .instructions h3 {
            color: ${typeColor};
            margin-top: 0;
        }
        
        .instructions ol {
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        @media print {
            .instructions { 
                page-break-before: always; 
            }
        }
    </style>
</head>
<body>
    <div class="badge-container">
        <div class="badge-header">
            <div class="event-title">FIRST AI SUMMIT CROYDON 2025</div>
            <div class="event-date">${badgeInfo.eventDetails.eventDate} • ${badgeInfo.eventDetails.venue}</div>
            <div class="participant-type">${badgeInfo.participantType}</div>
        </div>
        
        <div class="badge-body">
            <div class="participant-name">${badgeInfo.name}</div>
            
            <div class="participant-details">
                ${badgeInfo.company ? `${badgeInfo.company}<br>` : ''}
                ${badgeInfo.jobTitle ? `${badgeInfo.jobTitle}<br>` : ''}
                ${badgeInfo.email}
            </div>
            
            <div class="qr-section">
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
            </div>
            
            <div class="badge-id">
                Badge ID: ${badgeInfo.badgeId}
            </div>
        </div>
    </div>
    
    <div class="instructions">
        <h3>Badge Printing Instructions</h3>
        <ol>
            <li><strong>Print this page</strong> on A4 paper using your home or office printer</li>
            <li><strong>Cut out the badge</strong> along the border lines</li>
            <li><strong>Attach to clothing</strong> using a pin, clip, or lanyard</li>
            <li><strong>Bring to the event</strong> on ${badgeInfo.eventDetails.eventDate}</li>
            <li><strong>Present at entrance</strong> for QR code scanning and check-in</li>
        </ol>
        
        <p><strong>Important:</strong> Your QR code contains your unique registration information. Keep your badge safe and bring it to the AI Summit for entry.</p>
        
        <p><strong>Lost your badge?</strong> Contact us at info@croydonbusiness.co.uk or visit the registration desk on the day.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Create a badge for event participants
   */
  async createParticipantBadge(participantId: string, participantInfo: {
    participantType: 'attendee' | 'exhibitor' | 'speaker' | 'volunteer' | 'team';
    name: string;
    email: string;
    company?: string;
    jobTitle?: string;
    participantId: string;
  }): Promise<AISummitBadge> {
    const badgeId = this.generateBadgeId();

    const badgeInfo: BadgeInfo = {
      badgeId,
      participantType: participantInfo.participantType,
      participantId: participantInfo.participantId,
      name: participantInfo.name,
      email: participantInfo.email,
      company: participantInfo.company,
      jobTitle: participantInfo.jobTitle,
      eventDetails: this.eventInfo
    };

    // Generate QR code - include participant ID for scanning compatibility
    const qrCodeData = participantInfo.participantId; // Use participant ID directly for scanning

    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
      width: 300,
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
   * Get printable badge HTML
   */
  async getPrintableBadge(badgeId: string): Promise<string> {
    const badge = await storage.getAISummitBadgeById(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    // Generate QR code for the badge
    const qrCodeDataURL = await QRCode.toDataURL(badge.qrCodeData, {
      width: 200,
      margin: 2
    });

    const badgeInfo: BadgeInfo = {
      badgeId: badge.badgeId,
      participantType: badge.participantType as any,
      participantId: badge.participantId,
      name: badge.name,
      email: badge.email,
      company: badge.company || undefined,
      jobTitle: badge.jobTitle || undefined,
      eventDetails: this.eventInfo
    };

    return this.generatePrintableBadgeHTML(badgeInfo, qrCodeDataURL);
  }

  /**
   * Create badge for attendee registration
   */
  async createAttendeeBadge(registrationId: string, attendeeInfo: any): Promise<AISummitBadge> {
    return this.createParticipantBadge(registrationId, {
      participantType: 'attendee',
      name: attendeeInfo.name,
      email: attendeeInfo.email,
      company: attendeeInfo.company,
      jobTitle: attendeeInfo.jobTitle,
      participantId: registrationId
    });
  }

  /**
   * Create badge for exhibitor registration
   */
  async createExhibitorBadge(registrationId: string, exhibitorInfo: any): Promise<AISummitBadge> {
    return this.createParticipantBadge(registrationId, {
      participantType: 'exhibitor',
      name: exhibitorInfo.contactName,
      email: exhibitorInfo.contactEmail,
      company: exhibitorInfo.companyName,
      jobTitle: exhibitorInfo.contactJobTitle,
      participantId: registrationId
    });
  }

  /**
   * Create badge for speaker
   */
  async createSpeakerBadge(speakerId: string, speakerInfo: any): Promise<AISummitBadge> {
    return this.createParticipantBadge(speakerId, {
      participantType: 'speaker',
      name: speakerInfo.name,
      email: speakerInfo.email,
      company: speakerInfo.company,
      jobTitle: speakerInfo.jobTitle,
      participantId: speakerId
    });
  }

  /**
   * Create badge for volunteer
   */
  async createVolunteerBadge(volunteerId: string, volunteerInfo: any): Promise<AISummitBadge> {
    return this.createParticipantBadge(volunteerId, {
      participantType: 'volunteer',
      name: volunteerInfo.name,
      email: volunteerInfo.email,
      company: undefined,
      jobTitle: volunteerInfo.role,
      participantId: volunteerId
    });
  }

  /**
   * Create badge for team member
   */
  async createTeamBadge(teamMemberId: string, teamMemberInfo: any): Promise<AISummitBadge> {
    return this.createParticipantBadge(teamMemberId, {
      participantType: 'team',
      name: teamMemberInfo.name,
      email: teamMemberInfo.email,
      company: 'CBA Team',
      jobTitle: teamMemberInfo.role,
      participantId: teamMemberId
    });
  }

  /**
   * Process check-in/check-out for a badge
   */
  async processCheckIn(badgeId: string, checkInType: 'check_in' | 'check_out' = 'check_in', 
                      location: string = 'main_entrance', staffMember?: string): Promise<CheckInResult> {
    try {
      const badge = await storage.getAISummitBadgeById(badgeId);
      
      if (!badge) {
        return {
          success: false,
          checkInType,
          message: 'Badge not found. Please verify the badge ID and try again.'
        };
      }

      if (!badge.isActive) {
        return {
          success: false,
          checkInType,
          message: 'This badge has been deactivated. Please contact support.'
        };
      }

      // Get previous check-ins for this badge
      const previousCheckIns = await storage.getAISummitCheckInsByBadgeId(badgeId);
      const lastCheckIn = previousCheckIns[previousCheckIns.length - 1];
      
      // Determine if this is a valid check-in/out sequence
      if (checkInType === 'check_in' && lastCheckIn?.checkInType === 'check_in') {
        return {
          success: false,
          checkInType,
          message: 'Already checked in. Please check out first before checking in again.'
        };
      }
      
      if (checkInType === 'check_out' && (!lastCheckIn || lastCheckIn.checkInType === 'check_out')) {
        return {
          success: false,
          checkInType,
          message: 'Not currently checked in. Please check in first.'
        };
      }

      // Record the check-in/out
      const checkInData: InsertAISummitCheckIn = {
        badgeId,
        checkInType,
        checkInTime: new Date(),
        checkInLocation: location,
        checkInMethod: 'qr_scan',
        staffMember: staffMember || 'System'
      };

      await storage.createAISummitCheckIn(checkInData);

      const isFirstCheckIn = checkInType === 'check_in' && previousCheckIns.filter(c => c.checkInType === 'check_in').length === 0;

      return {
        success: true,
        badge,
        checkInType,
        message: checkInType === 'check_in' 
          ? `Welcome${isFirstCheckIn ? ' to your first visit' : ' back'}, ${badge.name}!`
          : `Goodbye, ${badge.name}! Thanks for attending.`,
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