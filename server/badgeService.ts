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
  participantType: 'attendee' | 'exhibitor' | 'speaker' | 'volunteer' | 'team' | 'special_guest' | 'other';
  customRole?: string;
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
      width: 150,
      margin: 1,
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
            size: 102mm 76mm; /* Standard badge holder size */
            margin: 3mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            width: 96mm;
            height: 70mm;
            overflow: hidden;
        }
        
        .badge-container {
            width: 96mm;
            height: 70mm;
            background: white;
            border-radius: 8px;
            padding: 4mm;
            box-sizing: border-box;
            text-align: center;
            border: 2px solid ${badgeColor};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .header {
            background: ${badgeColor};
            color: white;
            padding: 3mm;
            border-radius: 4px;
            margin-bottom: 2mm;
            flex-shrink: 0;
        }
        
        .cba-logo {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 1mm;
            line-height: 1.1;
        }
        
        .badge-type {
            background: rgba(255,255,255,0.2);
            padding: 1mm 2mm;
            border-radius: 3mm;
            font-size: 7pt;
            font-weight: 600;
            line-height: 1.1;
        }
        
        .qr-section {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 1mm 0;
        }
        
        .qr-code {
            width: 20mm;
            height: 20mm;
            margin: 0 auto 1mm;
            border: 1px solid ${badgeColor};
            border-radius: 2mm;
            padding: 1mm;
            background: white;
        }
        
        .qr-handle {
            font-size: 6pt;
            font-weight: bold;
            color: ${badgeColor};
            background: rgba(59, 130, 246, 0.1);
            padding: 1mm 2mm;
            border-radius: 2mm;
            display: inline-block;
            line-height: 1.1;
        }
        
        .name-section {
            margin: 1mm 0;
            flex-shrink: 0;
        }
        
        .name {
            font-size: 9pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }
        
        .title {
            font-size: 7pt;
            color: #9333EA;
            font-weight: 600;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }
        
        .job-title {
            font-size: 6pt;
            color: #6b7280;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }
        
        .company {
            font-size: 7pt;
            color: #374151;
            font-weight: 500;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }
        
        .contact-info {
            font-size: 6pt;
            color: #6b7280;
            margin-bottom: 1mm;
            line-height: 1.1;
        }
        
        .badge-id {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 2mm;
            padding: 1mm;
            margin: 1mm 0;
            flex-shrink: 0;
        }
        
        .badge-id-label {
            font-size: 5pt;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
            line-height: 1.1;
        }
        
        .badge-id-value {
            font-size: 6pt;
            font-weight: bold;
            color: #1f2937;
            font-family: 'Courier New', monospace;
            line-height: 1.1;
        }
        
        .footer {
            margin-top: 1mm;
            padding-top: 1mm;
            border-top: 1px solid #e5e7eb;
            font-size: 5pt;
            color: #6b7280;
            line-height: 1.1;
            flex-shrink: 0;
        }
        
        .membership-tier {
            background: ${badgeColor};
            color: white;
            padding: 1mm 2mm;
            border-radius: 2mm;
            font-size: 6pt;
            font-weight: 600;
            display: inline-block;
            margin-top: 0.5mm;
            line-height: 1.1;
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
      team: '#EF4444', // Red
      special_guest: '#DC2626', // Deep Red
      other: '#6B7280' // Gray
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
            size: 102mm 76mm; /* Standard badge holder size */
            margin: 3mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            width: 96mm;
            height: 70mm;
            overflow: hidden;
        }
        
        .badge-container {
            width: 96mm;
            height: 70mm;
            background: white;
            border-radius: 8px;
            padding: 4mm;
            box-sizing: border-box;
            text-align: center;
            border: 2px solid ${typeColor};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .badge-header {
            background: linear-gradient(135deg, ${typeColor}, ${typeColor}dd);
            color: white;
            padding: 3mm;
            border-radius: 4px;
            margin-bottom: 2mm;
            flex-shrink: 0;
        }
        
        .event-title {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 1mm;
            line-height: 1.1;
        }
        
        .event-date {
            font-size: 7pt;
            opacity: 0.9;
            line-height: 1.1;
        }
        
        .participant-type {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 1mm 2mm;
            border-radius: 3mm;
            font-size: 6pt;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            margin-top: 1mm;
            line-height: 1.1;
        }
        
        .badge-body {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 1mm 0;
        }
        
        .participant-name {
            font-size: 9pt;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }
        
        .participant-details {
            font-size: 6pt;
            color: #666;
            margin-bottom: 1mm;
            line-height: 1.1;
        }
        
        .qr-section {
            margin: 1mm 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .qr-code {
            width: 20mm;
            height: 20mm;
            border: 1px solid ${typeColor};
            border-radius: 2mm;
            padding: 1mm;
            background: white;
        }
        
        .badge-id {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 2mm;
            padding: 1mm;
            margin-top: 1mm;
            font-size: 5pt;
            color: #666;
            font-family: 'Courier New', monospace;
            line-height: 1.1;
            flex-shrink: 0;
        }
        
        .instructions {
            display: none; /* Hidden for badge holder format */
        }
        
        @media print {
            body { 
                background: white; 
            }
            .badge-container {
                border: 2px solid ${typeColor};
            }
        }
    </style>
</head>
<body>
    <div class="badge-container">
        <div class="badge-header">
            <div class="event-title">FIRST AI SUMMIT CROYDON 2025</div>
            <div class="event-date">${badgeInfo.eventDetails.eventDate} • ${badgeInfo.eventDetails.venue}</div>
            <div class="participant-type">${badgeInfo.participantType === 'other' && badgeInfo.customRole 
              ? badgeInfo.customRole.toUpperCase() 
              : badgeInfo.participantType === 'special_guest' 
                ? 'SPECIAL GUEST'
                : badgeInfo.participantType.toUpperCase()
            }</div>
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
    participantType: 'attendee' | 'exhibitor' | 'speaker' | 'volunteer' | 'team' | 'special_guest' | 'other';
    customRole?: string; // For 'other' participant type
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
      customRole: participantInfo.customRole,
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
      width: 150,
      margin: 1,
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
      case 'special_guest':
        badgeDesign = 'vip';
        break;
      case 'other':
        badgeDesign = 'standard';
        break;
      default:
        badgeDesign = 'standard';
    }

    const badgeData: InsertAISummitBadge = {
      badgeId,
      participantType: participantInfo.participantType,
      customRole: participantInfo.customRole || null,
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
      width: 150,
      margin: 1
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