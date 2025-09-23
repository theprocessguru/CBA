#!/usr/bin/env tsx

/**
 * Data Migration Script: Move stand data from aiSummitExhibitorRegistrations to stands table
 * 
 * This script migrates existing exhibition stand data from the legacy aiSummitExhibitorRegistrations
 * table to the new stands table structure with proper pricing calculations.
 * 
 * Run with: npx tsx scripts/migrate-stands-data.ts
 */

import { db } from "../server/db";
import { 
  aiSummitExhibitorRegistrations, 
  businessEvents, 
  stands 
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

interface LegacyStandData {
  id: number;
  standLocation: string | null;
  standNumber: string | null;
  standSize: string | null;
  companyName: string;
  contactName: string;
  email: string;
}

// Helper function to parse stand dimensions from size string
function parseStandDimensions(standSize: string | null): { width: number; length: number } {
  if (!standSize) return { width: 3, length: 3 }; // Default 3x3m
  
  // Handle formats like "3x3m", "6x3m", "9x3m", "3m x 3m", etc.
  const sizeMatch = standSize.toLowerCase().match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  
  if (sizeMatch) {
    return {
      width: parseFloat(sizeMatch[1]),
      length: parseFloat(sizeMatch[2])
    };
  }
  
  // Handle single dimension (assume square)
  const singleMatch = standSize.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const size = parseFloat(singleMatch[1]);
    return { width: size, length: size };
  }
  
  // Default fallback
  return { width: 3, length: 3 };
}

// Helper function to calculate pricing
function calculateStandPricing(width: number, length: number, pricePerSquareMetre: number): {
  squareMetres: number;
  standardCost: number;
  finalCost: number;
} {
  const squareMetres = Math.round(width * length * 100) / 100;
  const standardCost = Math.round(squareMetres * pricePerSquareMetre * 100) / 100;
  
  return {
    squareMetres,
    standardCost,
    finalCost: standardCost
  };
}

async function migrateStandsData() {
  console.log("🚀 Starting stands data migration...");
  
  try {
    // Step 1: Get all exhibitor registrations with stand data
    console.log("📋 Fetching existing exhibitor registrations with stand data...");
    const exhibitorRegistrations = await db
      .select({
        id: aiSummitExhibitorRegistrations.id,
        standLocation: aiSummitExhibitorRegistrations.standLocation,
        standNumber: aiSummitExhibitorRegistrations.standNumber,
        standSize: aiSummitExhibitorRegistrations.standSize,
        companyName: aiSummitExhibitorRegistrations.companyName,
        contactName: aiSummitExhibitorRegistrations.contactName,
        email: aiSummitExhibitorRegistrations.email,
      })
      .from(aiSummitExhibitorRegistrations)
      .where(sql`${aiSummitExhibitorRegistrations.standNumber} IS NOT NULL`);

    console.log(`📊 Found ${exhibitorRegistrations.length} exhibitor registrations with stand data`);

    if (exhibitorRegistrations.length === 0) {
      console.log("✅ No stand data to migrate. Migration complete.");
      return;
    }

    // Step 2: Find or create a default event for AI Summit stands
    console.log("🔍 Looking for AI Summit event...");
    let targetEvent = await db
      .select()
      .from(businessEvents)
      .where(sql`LOWER(${businessEvents.eventName}) LIKE '%ai summit%'`)
      .limit(1);

    if (targetEvent.length === 0) {
      console.log("📝 Creating default AI Summit event for stand migration...");
      const [newEvent] = await db
        .insert(businessEvents)
        .values({
          businessId: 1, // Assuming business ID 1 exists (CBA)
          eventName: "AI Summit 2025 - Exhibition",
          eventSlug: "ai-summit-2025-exhibition",
          description: "Exhibition area for AI Summit 2025",
          eventType: "exhibition",
          eventDate: "2025-10-01",
          startTime: "10:00",
          endTime: "16:00",
          venue: "LSBU",
          venueAddress: "London South Bank University",
          hasExhibitionArea: true,
          pricePerSquareMetre: "50.00", // Default £50 per square metre
          isApproved: true,
          isActive: true,
        })
        .returning();
      
      targetEvent = [newEvent];
      console.log(`✅ Created event with ID: ${newEvent.id}`);
    }

    const eventId = targetEvent[0].id;
    const pricePerSquareMetre = parseFloat(targetEvent[0].pricePerSquareMetre || "50.00");

    console.log(`🎯 Using event ID: ${eventId} with price per square metre: £${pricePerSquareMetre}`);

    // Step 3: Migrate each exhibitor registration to a stand
    console.log("🔄 Migrating exhibitor registrations to stands...");
    let migratedCount = 0;
    let skippedCount = 0;

    for (const registration of exhibitorRegistrations) {
      try {
        // Parse dimensions
        const { width, length } = parseStandDimensions(registration.standSize);
        const pricing = calculateStandPricing(width, length, pricePerSquareMetre);

        // Generate stand number if missing
        const standNumber = registration.standNumber || `AUTO-${registration.id}`;
        
        // Check if stand already exists
        const existingStand = await db
          .select()
          .from(stands)
          .where(sql`${stands.eventId} = ${eventId} AND ${stands.standNumber} = ${standNumber}`)
          .limit(1);

        if (existingStand.length > 0) {
          console.log(`⚠️  Stand ${standNumber} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create the stand
        await db.insert(stands).values({
          eventId,
          standNumber,
          location: registration.standLocation || "Exhibition Hall",
          width: width.toString(),
          length: length.toString(),
          squareMetres: pricing.squareMetres.toString(),
          standardCost: pricing.standardCost.toString(),
          finalCost: pricing.finalCost.toString(),
          exhibitorRegistrationId: registration.id,
          status: "occupied",
          notes: `Migrated from exhibitor registration. Company: ${registration.companyName}, Contact: ${registration.contactName}`,
        });

        migratedCount++;
        console.log(`✅ Migrated stand ${standNumber} for ${registration.companyName} (${width}x${length}m, £${pricing.finalCost})`);

      } catch (error) {
        console.error(`❌ Failed to migrate registration ${registration.id}:`, error);
        skippedCount++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`✅ Successfully migrated: ${migratedCount} stands`);
    console.log(`⚠️  Skipped: ${skippedCount} records`);
    console.log(`📋 Total processed: ${exhibitorRegistrations.length} records`);

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Review the migrated stands in the admin interface");
    console.log("2. Adjust any pricing or dimensions as needed");
    console.log("3. Consider removing stand fields from aiSummitExhibitorRegistrations table");

  } catch (error) {
    console.error("💥 Migration failed:", error);
    throw error;
  }
}

// Execute the migration if this script is run directly
if (require.main === module) {
  migrateStandsData()
    .then(() => {
      console.log("✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateStandsData };