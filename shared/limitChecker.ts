import { MEMBERSHIP_TIER_CONFIGS } from './membershipTiers';

export interface UserLimits {
  businessListings: number;
  productListings: number;
  offerListings: number;
  imageUploads: number;
  eventBookingsPerMonth: number;
  referralsPerMonth: number;
  newsletterSubscribers: number;
  socialMediaPosts: number;
}

export interface UserCurrentUsage {
  businessListings: number;
  productListings: number;
  offerListings: number;
  imageUploads: number;
  eventBookingsThisMonth: number;
  referralsThisMonth: number;
  newsletterSubscribers: number;
  socialMediaPostsThisMonth: number;
}

export class MembershipLimitChecker {
  static getLimitsForTier(membershipTier: string): UserLimits {
    const config = MEMBERSHIP_TIER_CONFIGS[membershipTier];
    if (!config) {
      // Default to Starter tier limits if tier not found
      return MEMBERSHIP_TIER_CONFIGS['Starter Tier'].limits;
    }
    return config.limits;
  }

  static checkLimit(
    limitType: keyof UserLimits, 
    currentUsage: number, 
    membershipTier: string,
    incrementBy: number = 1
  ): {
    allowed: boolean;
    limit: number;
    currentUsage: number;
    wouldExceed: boolean;
    remaining: number;
  } {
    const limits = this.getLimitsForTier(membershipTier);
    const limit = limits[limitType];
    const wouldExceed = (currentUsage + incrementBy) > limit;
    
    return {
      allowed: !wouldExceed,
      limit,
      currentUsage,
      wouldExceed,
      remaining: Math.max(0, limit - currentUsage)
    };
  }

  static checkMultipleLimits(
    checks: Array<{
      limitType: keyof UserLimits;
      currentUsage: number;
      incrementBy?: number;
    }>,
    membershipTier: string
  ): {
    allAllowed: boolean;
    results: Array<{
      limitType: keyof UserLimits;
      allowed: boolean;
      limit: number;
      currentUsage: number;
      remaining: number;
      message: string;
    }>;
  } {
    const results = checks.map(check => {
      const result = this.checkLimit(
        check.limitType, 
        check.currentUsage, 
        membershipTier, 
        check.incrementBy || 1
      );
      
      return {
        limitType: check.limitType,
        allowed: result.allowed,
        limit: result.limit,
        currentUsage: result.currentUsage,
        remaining: result.remaining,
        message: result.allowed 
          ? `✓ Within limit (${result.currentUsage + (check.incrementBy || 1)}/${result.limit})`
          : `⚠️ Would exceed limit (${result.currentUsage + (check.incrementBy || 1)}/${result.limit})`
      };
    });

    return {
      allAllowed: results.every(r => r.allowed),
      results
    };
  }

  static getUpgradeMessage(limitType: keyof UserLimits, membershipTier: string): string {
    const currentConfig = MEMBERSHIP_TIER_CONFIGS[membershipTier];
    const nextTiers = Object.values(MEMBERSHIP_TIER_CONFIGS)
      .filter(tier => tier.monthlyPrice > currentConfig.monthlyPrice)
      .sort((a, b) => a.monthlyPrice - b.monthlyPrice);

    if (nextTiers.length === 0) {
      return "You're already on the highest tier!";
    }

    const nextTier = nextTiers[0];
    const nextLimit = nextTier.limits[limitType];
    
    return `Upgrade to ${nextTier.name} (£${nextTier.monthlyPrice}/month) to increase your ${limitType.replace(/([A-Z])/g, ' $1').toLowerCase()} limit to ${nextLimit}.`;
  }
}

export default MembershipLimitChecker;