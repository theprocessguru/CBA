# MyT Automation Custom Fields Setup Guide

This document contains all custom fields that need to be created in your MyT Automation account to properly sync data from the CBA application.

## How to Create Custom Fields in MyT Automation

1. Log into your MyT Automation account
2. Go to **Settings** → **Custom Fields**
3. Click **Add Field** for each field listed below
4. Use the exact Field Name provided (case-sensitive)
5. Select the appropriate Field Type as indicated
6. Save each field

---

## 1. CORE USER/CONTACT FIELDS

### Basic Information
- **Field Name**: `membershipTier` | **Type**: Dropdown
  - Options: Starter Tier, Growth Tier, Strategic Tier, Patron Tier, Partner
- **Field Name**: `membershipStatus` | **Type**: Dropdown
  - Options: trial, active, suspended, expired
- **Field Name**: `isTrialMember` | **Type**: Checkbox
- **Field Name**: `trialDonationPaid` | **Type**: Checkbox
- **Field Name**: `donationAmount` | **Type**: Number
- **Field Name**: `donationDate` | **Type**: Date
- **Field Name**: `membershipStartDate` | **Type**: Date
- **Field Name**: `membershipEndDate` | **Type**: Date

### Account Status
- **Field Name**: `accountStatus` | **Type**: Dropdown
  - Options: active, suspended, closed
- **Field Name**: `suspensionReason` | **Type**: Text Area
- **Field Name**: `suspendedAt` | **Type**: Date
- **Field Name**: `suspendedBy` | **Type**: Text
- **Field Name**: `isAdmin` | **Type**: Checkbox
- **Field Name**: `emailVerified` | **Type**: Checkbox

### Professional Information
- **Field Name**: `company` | **Type**: Text
- **Field Name**: `jobTitle` | **Type**: Text
- **Field Name**: `title` | **Type**: Text (e.g., Mayor, CEO, Founder)
- **Field Name**: `bio` | **Type**: Text Area
- **Field Name**: `qrHandle` | **Type**: Text
- **Field Name**: `isProfileHidden` | **Type**: Checkbox

### Student/Volunteer Information
- **Field Name**: `university` | **Type**: Text
- **Field Name**: `studentId` | **Type**: Text
- **Field Name**: `course` | **Type**: Text
- **Field Name**: `yearOfStudy` | **Type**: Dropdown
  - Options: 1st Year, 2nd Year, 3rd Year, 4th Year, Postgraduate
- **Field Name**: `communityRole` | **Type**: Text
- **Field Name**: `volunteerExperience` | **Type**: Text Area

---

## 2. BUSINESS PROFILE FIELDS

- **Field Name**: `businessName` | **Type**: Text
- **Field Name**: `businessDescription` | **Type**: Text Area
- **Field Name**: `businessAddress` | **Type**: Text
- **Field Name**: `businessCity` | **Type**: Text
- **Field Name**: `businessPostcode` | **Type**: Text
- **Field Name**: `businessPhone` | **Type**: Phone
- **Field Name**: `businessEmail` | **Type**: Email
- **Field Name**: `businessWebsite` | **Type**: URL
- **Field Name**: `businessCategory` | **Type**: Text
- **Field Name**: `businessEstablished` | **Type**: Text
- **Field Name**: `employeeCount` | **Type**: Number
- **Field Name**: `isBusinessVerified` | **Type**: Checkbox
- **Field Name**: `isBusinessActive` | **Type**: Checkbox

---

## 3. AI SUMMIT REGISTRATION FIELDS

### General Attendee Fields
- **Field Name**: `aiSummitRegistered` | **Type**: Checkbox
- **Field Name**: `businessType` | **Type**: Text
- **Field Name**: `aiInterest` | **Type**: Text Area
- **Field Name**: `accessibilityNeeds` | **Type**: Text Area
- **Field Name**: `participantRoles` | **Type**: Multi-Select
  - Options: attendee, exhibitor, speaker, organizer, volunteer, team
- **Field Name**: `customRole` | **Type**: Text
- **Field Name**: `primaryRole` | **Type**: Dropdown
  - Options: attendee, exhibitor, speaker, organizer, volunteer, team

### Badge Information
- **Field Name**: `badgeId` | **Type**: Text
- **Field Name**: `badgeDesign` | **Type**: Dropdown
  - Options: standard, vip, speaker, volunteer, team
- **Field Name**: `badgeColor` | **Type**: Dropdown
  - Options: blue, green, red, gold, purple
- **Field Name**: `accessLevel` | **Type**: Dropdown
  - Options: basic, premium, vip, staff, admin
- **Field Name**: `badgePrinted` | **Type**: Checkbox
- **Field Name**: `badgePrintedAt` | **Type**: Date/Time

---

## 4. EXHIBITOR SPECIFIC FIELDS

- **Field Name**: `exhibitorCompanyName` | **Type**: Text
- **Field Name**: `exhibitorContactName` | **Type**: Text
- **Field Name**: `exhibitorWebsite` | **Type**: URL
- **Field Name**: `productsServices` | **Type**: Text Area
- **Field Name**: `exhibitionGoals` | **Type**: Text Area
- **Field Name**: `boothRequirements` | **Type**: Dropdown
  - Options: Standard, Premium, Custom
- **Field Name**: `electricalNeeds` | **Type**: Checkbox
- **Field Name**: `internetNeeds` | **Type**: Checkbox
- **Field Name**: `specialRequirements` | **Type**: Text Area
- **Field Name**: `marketingMaterials` | **Type**: Text Area
- **Field Name**: `numberOfExhibitorAttendees` | **Type**: Number
- **Field Name**: `previousExhibitor` | **Type**: Checkbox
- **Field Name**: `referralSource` | **Type**: Text

---

## 5. SPEAKER SPECIFIC FIELDS

- **Field Name**: `speakerLinkedIn` | **Type**: URL
- **Field Name**: `speakerBio` | **Type**: Text Area
- **Field Name**: `sessionType` | **Type**: Dropdown
  - Options: talk, workshop, keynote, panel, demo
- **Field Name**: `talkTitle` | **Type**: Text
- **Field Name**: `talkDescription` | **Type**: Text Area
- **Field Name**: `talkDuration` | **Type**: Text
- **Field Name**: `audienceLevel` | **Type**: Dropdown
  - Options: beginner, intermediate, advanced
- **Field Name**: `speakingExperience` | **Type**: Text Area
- **Field Name**: `previousSpeaking` | **Type**: Checkbox
- **Field Name**: `techRequirements` | **Type**: Text Area
- **Field Name**: `availableSlots` | **Type**: Text Area
- **Field Name**: `motivationToSpeak` | **Type**: Text Area
- **Field Name**: `keyTakeaways` | **Type**: Text Area
- **Field Name**: `interactiveElements` | **Type**: Checkbox
- **Field Name**: `handoutsProvided` | **Type**: Checkbox

---

## 6. VOLUNTEER SPECIFIC FIELDS

- **Field Name**: `volunteerRole` | **Type**: Dropdown
  - Options: registration_desk, information, technical_support, logistics, security
- **Field Name**: `volunteerShift` | **Type**: Dropdown
  - Options: morning, afternoon, full_day
- **Field Name**: `volunteerAvailability` | **Type**: Text Area
- **Field Name**: `emergencyContact` | **Type**: Phone
- **Field Name**: `tShirtSize` | **Type**: Dropdown
  - Options: XS, S, M, L, XL, XXL, XXXL
- **Field Name**: `dietaryRequirements` | **Type**: Text Area

---

## 7. SPONSOR SPECIFIC FIELDS

- **Field Name**: `sponsorshipTier` | **Type**: Dropdown
  - Options: Bronze, Silver, Gold, Platinum
- **Field Name**: `sponsorshipAmount` | **Type**: Number
- **Field Name**: `sponsorshipBenefits` | **Type**: Text Area
- **Field Name**: `sponsorLogoUrl` | **Type**: URL
- **Field Name**: `sponsorDescription` | **Type**: Text Area
- **Field Name**: `sponsorWebsite` | **Type**: URL
- **Field Name**: `sponsorIndustry` | **Type**: Text
- **Field Name**: `sponsorFounded` | **Type**: Number
- **Field Name**: `sponsorEmployees` | **Type**: Text
- **Field Name**: `sponsorLocation` | **Type**: Text
- **Field Name**: `sponsorSpecialties` | **Type**: Text Area
- **Field Name**: `sponsorAchievements` | **Type**: Text Area
- **Field Name**: `sponsorContactPerson` | **Type**: Text
- **Field Name**: `sponsorContactEmail` | **Type**: Email
- **Field Name**: `sponsorContactPhone` | **Type**: Phone
- **Field Name**: `sponsorMarketingNeeds` | **Type**: Text Area
- **Field Name**: `sponsorEventGoals` | **Type**: Text Area
- **Field Name**: `sponsorBoothStaff` | **Type**: Number
- **Field Name**: `sponsorSocialLinkedIn` | **Type**: URL
- **Field Name**: `sponsorSocialTwitter` | **Type**: URL

---

## 8. WORKSHOP REGISTRATION FIELDS

- **Field Name**: `registeredWorkshops` | **Type**: Text Area
- **Field Name**: `workshopExperienceLevel` | **Type**: Dropdown
  - Options: beginner, intermediate, advanced
- **Field Name**: `workshopSpecificInterests` | **Type**: Text Area
- **Field Name**: `workshopAccessibilityNeeds` | **Type**: Text Area
- **Field Name**: `workshopCheckedIn` | **Type**: Checkbox
- **Field Name**: `workshopNoShow` | **Type**: Checkbox

---

## 9. EVENT CHECK-IN TRACKING

- **Field Name**: `eventCheckedIn` | **Type**: Checkbox
- **Field Name**: `checkInTime` | **Type**: Date/Time
- **Field Name**: `checkOutTime` | **Type**: Date/Time
- **Field Name**: `checkInLocation` | **Type**: Text
- **Field Name**: `checkInMethod` | **Type**: Dropdown
  - Options: qr_scan, manual_entry
- **Field Name**: `eventAttendanceNotes` | **Type**: Text Area

---

## 10. AFFILIATE PROGRAM FIELDS

- **Field Name**: `isAffiliate` | **Type**: Checkbox
- **Field Name**: `affiliateCode` | **Type**: Text
- **Field Name**: `affiliateCommissionRate` | **Type**: Number
- **Field Name**: `affiliateTotalEarned` | **Type**: Number
- **Field Name**: `affiliateTotalPaid` | **Type**: Number
- **Field Name**: `affiliatePaymentMethod` | **Type**: Dropdown
  - Options: stripe, bank_transfer, paypal
- **Field Name**: `affiliateStripeAccountId` | **Type**: Text
- **Field Name**: `affiliateReferralCount` | **Type**: Number
- **Field Name**: `affiliateStatus` | **Type**: Dropdown
  - Options: active, pending, suspended

---

## 11. INTERACTION & ENGAGEMENT FIELDS

- **Field Name**: `lastInteractionDate` | **Type**: Date/Time
- **Field Name**: `totalInteractions` | **Type**: Number
- **Field Name**: `preferredContactMethod` | **Type**: Dropdown
  - Options: email, phone, sms, whatsapp
- **Field Name**: `marketingConsent` | **Type**: Checkbox
- **Field Name**: `newsletterSubscribed` | **Type**: Checkbox
- **Field Name**: `smsOptIn` | **Type**: Checkbox

---

## 12. FINANCIAL & PAYMENT FIELDS

- **Field Name**: `stripeCustomerId` | **Type**: Text
- **Field Name**: `stripeSubscriptionId` | **Type**: Text
- **Field Name**: `lastPaymentDate` | **Type**: Date
- **Field Name**: `lastPaymentAmount` | **Type**: Number
- **Field Name**: `totalLifetimeValue` | **Type**: Number
- **Field Name**: `outstandingBalance` | **Type**: Number
- **Field Name**: `paymentMethod` | **Type**: Text

---

## TAGS TO CREATE IN GHL

In addition to custom fields, create these tags in GoHighLevel for easy segmentation:

### Membership Tags
- `CBA_Member`
- `CBA_Trial_Member`
- `CBA_Starter_Tier`
- `CBA_Growth_Tier`
- `CBA_Strategic_Tier`
- `CBA_Patron_Tier`
- `CBA_Partner`
- `CBA_Admin`

### AI Summit Tags
- `AI_Summit_Registered`
- `AI_Summit_Attendee`
- `AI_Summit_Speaker`
- `AI_Summit_Exhibitor`
- `AI_Summit_Volunteer`
- `AI_Summit_Sponsor`
- `AI_Summit_Team`
- `AI_Summit_VIP`
- `AI_Summit_Checked_In`

### Status Tags
- `Active_Member`
- `Suspended_Member`
- `Email_Verified`
- `Badge_Issued`
- `Workshop_Registered`

### Engagement Tags
- `High_Engagement`
- `Newsletter_Subscriber`
- `SMS_Opted_In`
- `Affiliate_Active`

---

## AUTOMATION TRIGGERS TO SET UP

After creating fields, set up these automations:

1. **New Registration Trigger**: When `aiSummitRegistered` becomes true
2. **Membership Upgrade Trigger**: When `membershipTier` changes
3. **Badge Creation Trigger**: When `badgeId` is populated
4. **Check-in Trigger**: When `eventCheckedIn` becomes true
5. **Volunteer Assignment**: When `volunteerRole` is set
6. **Speaker Confirmation**: When `sessionType` is populated

---

## NOTES

- Field names are case-sensitive - use exactly as shown
- Some fields store JSON data as text - these will need special handling in automations
- Date fields should use the Date or Date/Time type in GHL
- Multi-select fields can be implemented as tags or comma-separated text fields
- Consider creating separate pipelines for different participant types (Attendees, Speakers, Exhibitors, etc.)

---

## TESTING

After creating all fields:
1. Test syncing a contact from the CBA app
2. Verify all fields populate correctly
3. Test automations trigger properly
4. Check that tags are applied correctly

For support or questions about field mapping, refer to the GHL API documentation or contact support.