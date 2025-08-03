import { storage } from './storage';
import MembershipLimitChecker, { UserCurrentUsage, UserLimits } from '../shared/limitChecker';

export class LimitService {
  /**
   * Get current usage statistics for a user
   */
  static async getCurrentUsage(userId: string): Promise<UserCurrentUsage> {
    try {
      // Get user's businesses, products, and offers
      const businesses = await storage.getUserBusinesses(userId);
      const products = await storage.getUserProducts(userId);
      const offers = await storage.getUserOffers(userId);
      
      // Count image uploads (would need to track this in database)
      let imageUploads = 0;
      businesses.forEach(business => {
        if (business.profileImageUrl) imageUploads++;
      });
      products.forEach(product => {
        if (product.imageUrl) imageUploads++;
      });
      
      // For monthly metrics, we'd need to query by date range
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      return {
        businessListings: businesses.length,
        productListings: products.length,
        offerListings: offers.length,
        imageUploads,
        eventBookingsThisMonth: 0, // Would need separate tracking
        referralsThisMonth: 0, // Would need separate tracking
        newsletterSubscribers: 0, // Would need separate tracking
        socialMediaPostsThisMonth: 0 // Would need separate tracking
      };
    } catch (error) {
      console.error('Error getting current usage:', error);
      return {
        businessListings: 0,
        productListings: 0,
        offerListings: 0,
        imageUploads: 0,
        eventBookingsThisMonth: 0,
        referralsThisMonth: 0,
        newsletterSubscribers: 0,
        socialMediaPostsThisMonth: 0
      };
    }
  }

  /**
   * Check if user can perform an action based on their membership limits
   */
  static async canUserPerformAction(
    userId: string,
    actionType: keyof UserLimits,
    incrementBy: number = 1
  ): Promise<{
    allowed: boolean;
    limit: number;
    currentUsage: number;
    remaining: number;
    message: string;
    upgradeMessage?: string;
  }> {
    try {
      // Get user's membership tier
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const membershipTier = user.membershipTier || 'Starter Tier';
      const currentUsage = await this.getCurrentUsage(userId);
      
      const result = MembershipLimitChecker.checkLimit(
        actionType,
        currentUsage[actionType],
        membershipTier,
        incrementBy
      );

      let message = '';
      let upgradeMessage: string | undefined;

      if (result.allowed) {
        message = `✓ Action allowed. You'll have ${result.remaining - incrementBy} ${actionType} remaining.`;
      } else {
        message = `⚠️ Limit exceeded. You've reached your ${actionType} limit of ${result.limit}.`;
        upgradeMessage = MembershipLimitChecker.getUpgradeMessage(actionType, membershipTier);
      }

      return {
        allowed: result.allowed,
        limit: result.limit,
        currentUsage: result.currentUsage,
        remaining: result.remaining,
        message,
        upgradeMessage
      };
    } catch (error) {
      console.error('Error checking user limits:', error);
      return {
        allowed: false,
        limit: 0,
        currentUsage: 0,
        remaining: 0,
        message: 'Error checking limits',
      };
    }
  }

  /**
   * Get user's current usage dashboard
   */
  static async getUserLimitsDashboard(userId: string): Promise<{
    membershipTier: string;
    limits: UserLimits;
    usage: UserCurrentUsage;
    percentageUsed: Record<keyof UserLimits, number>;
    warningsNeeded: Array<{
      limitType: keyof UserLimits;
      percentageUsed: number;
      message: string;
    }>;
  }> {
    const user = await storage.getUser(userId);
    const membershipTier = user?.membershipTier || 'Starter Tier';
    const limits = MembershipLimitChecker.getLimitsForTier(membershipTier);
    const usage = await this.getCurrentUsage(userId);

    const percentageUsed: Record<keyof UserLimits, number> = {} as any;
    const warningsNeeded: Array<{
      limitType: keyof UserLimits;
      percentageUsed: number;
      message: string;
    }> = [];

    // Calculate percentage used for each limit
    Object.keys(limits).forEach(key => {
      const limitType = key as keyof UserLimits;
      const limit = limits[limitType];
      const used = usage[limitType];
      const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
      
      percentageUsed[limitType] = percentage;

      // Add warnings for high usage (80% or more)
      if (percentage >= 80) {
        warningsNeeded.push({
          limitType,
          percentageUsed: percentage,
          message: percentage >= 100 
            ? `You've exceeded your ${limitType} limit (${used}/${limit})`
            : `You're close to your ${limitType} limit (${used}/${limit})`
        });
      }
    });

    return {
      membershipTier,
      limits,
      usage,
      percentageUsed,
      warningsNeeded
    };
  }
}

export default LimitService;