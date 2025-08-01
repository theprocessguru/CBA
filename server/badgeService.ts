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
      isActive: false,
      notes: reason || 'Badge deactivated'
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