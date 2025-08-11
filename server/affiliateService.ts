import { db } from "./db";
import { 
  affiliates, 
  affiliateReferrals, 
  affiliateCommissions, 
  affiliatePayouts,
  affiliateClicks,
  users,
  type Affiliate,
  type AffiliateReferral,
  type AffiliateCommission,
  type AffiliatePayout,
  type InsertAffiliate,
  type InsertAffiliateReferral,
  type InsertAffiliateCommission
} from "@shared/schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export class AffiliateService {
  // Generate a unique affiliate code
  private generateAffiliateCode(userId: string): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CBA${random}`;
  }

  // Create affiliate account for a user
  async createAffiliateAccount(userId: string): Promise<Affiliate | null> {
    try {
      // Check if user already has an affiliate account
      const existing = await db.select()
        .from(affiliates)
        .where(eq(affiliates.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Generate unique affiliate code
      let affiliateCode = this.generateAffiliateCode(userId);
      let codeExists = true;
      let attempts = 0;

      while (codeExists && attempts < 10) {
        const existingCode = await db.select()
          .from(affiliates)
          .where(eq(affiliates.affiliateCode, affiliateCode))
          .limit(1);
        
        if (existingCode.length === 0) {
          codeExists = false;
        } else {
          affiliateCode = this.generateAffiliateCode(userId);
          attempts++;
        }
      }

      // Create affiliate account
      const newAffiliate: InsertAffiliate = {
        userId,
        affiliateCode,
        commissionRate: "5.00",
        isActive: true
      };

      const [created] = await db.insert(affiliates)
        .values(newAffiliate)
        .returning();

      return created;
    } catch (error) {
      console.error("Error creating affiliate account:", error);
      return null;
    }
  }

  // Get affiliate by user ID
  async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    try {
      const [affiliate] = await db.select()
        .from(affiliates)
        .where(eq(affiliates.userId, userId))
        .limit(1);

      return affiliate || null;
    } catch (error) {
      console.error("Error getting affiliate:", error);
      return null;
    }
  }

  // Get affiliate by code
  async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    try {
      const [affiliate] = await db.select()
        .from(affiliates)
        .where(eq(affiliates.affiliateCode, code))
        .limit(1);

      return affiliate || null;
    } catch (error) {
      console.error("Error getting affiliate by code:", error);
      return null;
    }
  }

  // Track affiliate click
  async trackClick(affiliateCode: string, data: {
    ipAddress?: string;
    userAgent?: string;
    referrerUrl?: string;
    landingPage?: string;
  }): Promise<void> {
    try {
      const affiliate = await this.getAffiliateByCode(affiliateCode);
      if (!affiliate) return;

      await db.insert(affiliateClicks)
        .values({
          affiliateId: affiliate.id,
          affiliateCode,
          ...data
        });
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
    }
  }

  // Create a referral
  async createReferral(affiliateCode: string, referredUserId: string): Promise<AffiliateReferral | null> {
    try {
      const affiliate = await this.getAffiliateByCode(affiliateCode);
      if (!affiliate) return null;

      // Check if user was already referred
      const existing = await db.select()
        .from(affiliateReferrals)
        .where(eq(affiliateReferrals.referredUserId, referredUserId))
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Get user details
      const [referredUser] = await db.select()
        .from(users)
        .where(eq(users.id, referredUserId))
        .limit(1);

      if (!referredUser) return null;

      const newReferral: InsertAffiliateReferral = {
        affiliateId: affiliate.id,
        referredUserId,
        currentMembershipTier: referredUser.membershipTier || undefined,
        membershipStatus: referredUser.membershipStatus || "pending"
      };

      const [created] = await db.insert(affiliateReferrals)
        .values(newReferral)
        .returning();

      // Mark the last click as converted if exists
      await db.update(affiliateClicks)
        .set({ 
          convertedToReferral: true,
          referralId: created.id
        })
        .where(
          and(
            eq(affiliateClicks.affiliateId, affiliate.id),
            eq(affiliateClicks.convertedToReferral, false)
          )
        );

      return created;
    } catch (error) {
      console.error("Error creating referral:", error);
      return null;
    }
  }

  // Process commission for a payment
  async processCommission(referredUserId: string, paymentAmount: number, stripePaymentIntentId?: string): Promise<void> {
    try {
      // Find the referral
      const [referral] = await db.select()
        .from(affiliateReferrals)
        .where(eq(affiliateReferrals.referredUserId, referredUserId))
        .limit(1);

      if (!referral || !referral.isActive) return;

      // Get affiliate details
      const [affiliate] = await db.select()
        .from(affiliates)
        .where(eq(affiliates.id, referral.affiliateId))
        .limit(1);

      if (!affiliate || !affiliate.isActive) return;

      // Calculate commission
      const commissionRate = parseFloat(affiliate.commissionRate || "5.00");
      const commissionAmount = (paymentAmount * commissionRate) / 100;

      // Create commission record
      const newCommission: InsertAffiliateCommission = {
        affiliateId: affiliate.id,
        referralId: referral.id,
        amount: paymentAmount.toString(),
        commissionAmount: commissionAmount.toString(),
        commissionRate: commissionRate.toString(),
        paymentDate: new Date(),
        stripePaymentIntentId,
        status: "pending"
      };

      await db.insert(affiliateCommissions)
        .values(newCommission);

      // Update affiliate earnings
      await db.update(affiliates)
        .set({
          pendingEarnings: sql`${affiliates.pendingEarnings} + ${commissionAmount}`,
          totalEarnings: sql`${affiliates.totalEarnings} + ${commissionAmount}`,
          updatedAt: new Date()
        })
        .where(eq(affiliates.id, affiliate.id));

      // Update referral stats
      await db.update(affiliateReferrals)
        .set({
          firstPaymentDate: referral.firstPaymentDate || new Date(),
          lifetimeValue: sql`${affiliateReferrals.lifetimeValue} + ${paymentAmount}`,
          totalCommissionEarned: sql`${affiliateReferrals.totalCommissionEarned} + ${commissionAmount}`,
          lastCommissionDate: new Date(),
          membershipStatus: "active",
          updatedAt: new Date()
        })
        .where(eq(affiliateReferrals.id, referral.id));

    } catch (error) {
      console.error("Error processing commission:", error);
    }
  }

  // Get affiliate stats
  async getAffiliateStats(affiliateId: number) {
    try {
      const [affiliate] = await db.select()
        .from(affiliates)
        .where(eq(affiliates.id, affiliateId))
        .limit(1);

      if (!affiliate) return null;

      // Get referrals count
      const referralsResult = await db.select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where membership_status = 'active')`
      })
        .from(affiliateReferrals)
        .where(eq(affiliateReferrals.affiliateId, affiliateId));

      // Get clicks count
      const clicksResult = await db.select({
        total: sql<number>`count(*)`,
        converted: sql<number>`count(*) filter (where converted_to_referral = true)`
      })
        .from(affiliateClicks)
        .where(eq(affiliateClicks.affiliateId, affiliateId));

      // Get recent commissions
      const recentCommissions = await db.select()
        .from(affiliateCommissions)
        .where(eq(affiliateCommissions.affiliateId, affiliateId))
        .orderBy(desc(affiliateCommissions.paymentDate))
        .limit(10);

      // Get referrals list
      const referralsList = await db.select({
        referral: affiliateReferrals,
        user: users
      })
        .from(affiliateReferrals)
        .leftJoin(users, eq(affiliateReferrals.referredUserId, users.id))
        .where(eq(affiliateReferrals.affiliateId, affiliateId))
        .orderBy(desc(affiliateReferrals.referralDate));

      return {
        affiliate,
        stats: {
          totalReferrals: Number(referralsResult[0]?.total || 0),
          activeReferrals: Number(referralsResult[0]?.active || 0),
          totalClicks: Number(clicksResult[0]?.total || 0),
          convertedClicks: Number(clicksResult[0]?.converted || 0),
          conversionRate: clicksResult[0]?.total ? 
            (Number(clicksResult[0].converted) / Number(clicksResult[0].total) * 100).toFixed(2) : "0.00"
        },
        recentCommissions,
        referrals: referralsList
      };
    } catch (error) {
      console.error("Error getting affiliate stats:", error);
      return null;
    }
  }

  // Process payout for affiliate
  async processPayout(affiliateId: number, amount: number): Promise<boolean> {
    try {
      const [affiliate] = await db.select()
        .from(affiliates)
        .where(eq(affiliates.id, affiliateId))
        .limit(1);

      if (!affiliate || parseFloat(affiliate.pendingEarnings || "0") < amount) {
        return false;
      }

      // Create payout record
      const [payout] = await db.insert(affiliatePayouts)
        .values({
          affiliateId,
          amount: amount.toString(),
          currency: "GBP",
          method: affiliate.payoutMethod || "stripe",
          status: "processing"
        })
        .returning();

      // Process Stripe payout if Stripe account is connected
      if (affiliate.stripeAccountId) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(amount * 100), // Convert to pence
            currency: "gbp",
            destination: affiliate.stripeAccountId,
            description: `Affiliate commission payout for ${affiliate.affiliateCode}`
          });

          // Update payout record with Stripe details
          await db.update(affiliatePayouts)
            .set({
              stripeTransferId: transfer.id,
              status: "completed",
              processedAt: new Date()
            })
            .where(eq(affiliatePayouts.id, payout.id));

          // Update affiliate earnings
          await db.update(affiliates)
            .set({
              pendingEarnings: sql`${affiliates.pendingEarnings} - ${amount}`,
              paidEarnings: sql`${affiliates.paidEarnings} + ${amount}`,
              lastPayoutDate: new Date(),
              updatedAt: new Date()
            })
            .where(eq(affiliates.id, affiliateId));

          // Mark commissions as paid
          await db.update(affiliateCommissions)
            .set({
              status: "paid",
              payoutId: payout.id,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(affiliateCommissions.affiliateId, affiliateId),
                eq(affiliateCommissions.status, "approved")
              )
            );

          return true;
        } catch (stripeError) {
          console.error("Stripe payout error:", stripeError);
          
          // Update payout status to failed
          await db.update(affiliatePayouts)
            .set({
              status: "failed",
              failureReason: (stripeError as Error).message
            })
            .where(eq(affiliatePayouts.id, payout.id));
          
          return false;
        }
      }

      // For non-Stripe payouts, mark as pending manual processing
      await db.update(affiliatePayouts)
        .set({ status: "pending" })
        .where(eq(affiliatePayouts.id, payout.id));

      return true;
    } catch (error) {
      console.error("Error processing payout:", error);
      return false;
    }
  }

  // Automatically enroll all existing users as affiliates
  async enrollAllUsersAsAffiliates(): Promise<number> {
    try {
      // Get all users who don't have affiliate accounts
      const usersWithoutAffiliate = await db.select()
        .from(users)
        .leftJoin(affiliates, eq(users.id, affiliates.userId))
        .where(sql`${affiliates.id} IS NULL`);

      let enrolled = 0;
      for (const { users: user } of usersWithoutAffiliate) {
        if (user) {
          const result = await this.createAffiliateAccount(user.id);
          if (result) enrolled++;
        }
      }

      return enrolled;
    } catch (error) {
      console.error("Error enrolling users as affiliates:", error);
      return 0;
    }
  }
}

export const affiliateService = new AffiliateService();