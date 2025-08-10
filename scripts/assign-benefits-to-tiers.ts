import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function assignBenefitsToTiers() {
  try {
    console.log('Starting benefit assignment to membership tiers...');
    
    // Clear existing assignments
    await pool.query('DELETE FROM membership_tier_benefits');
    console.log('Cleared existing assignments');
    
    // Get all benefits
    const benefitsResult = await pool.query(`
      SELECT id, name, category 
      FROM benefits 
      WHERE is_active = true 
      ORDER BY category, id
    `);
    
    const benefits = benefitsResult.rows;
    console.log(`Found ${benefits.length} active benefits`);
    
    // Define tier progression - each tier includes all benefits from lower tiers
    const tierHierarchy = [
      'Starter Tier',
      'Growth Tier', 
      'Strategic Tier',
      'Patron Tier',
      'Partner Tier'
    ];
    
    // Define which categories and specific benefits are available at each tier level
    // Based on the membership documentation:
    // Starter: 43 benefits (basic access)
    // Growth: 89 benefits (starter + growth features)
    // Strategic: 156 benefits (growth + strategic features)
    // Patron: 201 benefits (strategic + patron features)
    // Partner: 235 benefits (all benefits)
    
    // Category-based tier assignment rules
    const categoryTierRules = {
      // Basic categories available to all tiers
      'networking': 0, // Starter and up
      'directory': 0,  // Starter and up
      'communication': 0, // Starter and up
      
      // Mid-tier categories
      'marketing': 1, // Growth and up
      'support': 1,   // Growth and up
      'financial': 1, // Growth and up
      
      // Advanced categories
      'technology': 2, // Strategic and up
      'automation': 2, // Strategic and up
      'accounting': 2, // Strategic and up
      
      // Premium categories
      'ai_services': 2, // Strategic and up (but limited at lower tiers)
      'training': 3,   // Patron and up
      'access': 3,     // Patron and up
    };
    
    // AI services special handling - gradual rollout
    const aiServicesById = benefits.filter(b => b.category === 'ai_services').map(b => b.id);
    const aiBasicCount = 10;  // Starter gets 10 basic AI services
    const aiGrowthCount = 25; // Growth gets 25 AI services
    const aiStrategicCount = 50; // Strategic gets 50 AI services
    const aiPatronCount = 65; // Patron gets 65 AI services
    // Partner gets all 72 AI services
    
    // Process each benefit
    for (const benefit of benefits) {
      const benefitAssignments = [];
      
      // Determine which tiers get this benefit
      if (benefit.category === 'ai_services') {
        // Special handling for AI services - gradual rollout
        const aiIndex = aiServicesById.indexOf(benefit.id);
        
        if (aiIndex < aiBasicCount) {
          // First 10 AI services available to all tiers
          benefitAssignments.push(...tierHierarchy);
        } else if (aiIndex < aiGrowthCount) {
          // Next 15 AI services for Growth and up
          benefitAssignments.push(...tierHierarchy.slice(1));
        } else if (aiIndex < aiStrategicCount) {
          // Next 25 AI services for Strategic and up
          benefitAssignments.push(...tierHierarchy.slice(2));
        } else if (aiIndex < aiPatronCount) {
          // Next 15 AI services for Patron and up
          benefitAssignments.push(...tierHierarchy.slice(3));
        } else {
          // Remaining AI services for Partner only
          benefitAssignments.push('Partner Tier');
        }
      } else {
        // Regular category-based assignment
        const minTierLevel = categoryTierRules[benefit.category] ?? 0;
        benefitAssignments.push(...tierHierarchy.slice(minTierLevel));
      }
      
      // Insert assignments for this benefit
      for (const tierName of benefitAssignments) {
        await pool.query(`
          INSERT INTO membership_tier_benefits (tier_name, benefit_id, is_included)
          VALUES ($1, $2, true)
        `, [tierName, benefit.id]);
      }
    }
    
    // Verify the assignments
    const verifyResult = await pool.query(`
      SELECT 
        tier_name,
        COUNT(*) as benefit_count
      FROM membership_tier_benefits
      WHERE is_included = true
      GROUP BY tier_name
      ORDER BY 
        CASE tier_name
          WHEN 'Starter Tier' THEN 1
          WHEN 'Growth Tier' THEN 2
          WHEN 'Strategic Tier' THEN 3
          WHEN 'Patron Tier' THEN 4
          WHEN 'Partner Tier' THEN 5
        END
    `);
    
    console.log('\nBenefit assignments completed:');
    console.log('================================');
    for (const row of verifyResult.rows) {
      console.log(`${row.tier_name}: ${row.benefit_count} benefits`);
    }
    
    // Now let's fine-tune to match exact counts
    console.log('\nFine-tuning benefit counts to match requirements...');
    await fineTuneBenefitCounts();
    
  } catch (error) {
    console.error('Error assigning benefits:', error);
  } finally {
    await pool.end();
  }
}

async function fineTuneBenefitCounts() {
  // Target counts based on documentation
  const targetCounts = {
    'Starter Tier': 43,
    'Growth Tier': 89,
    'Strategic Tier': 156,
    'Patron Tier': 201,
    'Partner Tier': 235
  };
  
  // Get current counts
  const currentResult = await pool.query(`
    SELECT 
      tier_name,
      COUNT(*) as benefit_count
    FROM membership_tier_benefits
    WHERE is_included = true
    GROUP BY tier_name
  `);
  
  const currentCounts = {};
  currentResult.rows.forEach(row => {
    currentCounts[row.tier_name] = parseInt(row.benefit_count);
  });
  
  // Adjust each tier to match target
  for (const [tierName, targetCount] of Object.entries(targetCounts)) {
    const currentCount = currentCounts[tierName] || 0;
    const difference = targetCount - currentCount;
    
    if (difference === 0) {
      console.log(`✓ ${tierName}: Already at target (${targetCount} benefits)`);
      continue;
    }
    
    if (difference > 0) {
      // Need to add more benefits
      console.log(`Adding ${difference} benefits to ${tierName}...`);
      
      // Find benefits not yet assigned to this tier
      const unassignedResult = await pool.query(`
        SELECT b.id
        FROM benefits b
        WHERE b.is_active = true
        AND b.id NOT IN (
          SELECT benefit_id 
          FROM membership_tier_benefits 
          WHERE tier_name = $1 AND is_included = true
        )
        ORDER BY b.category, b.id
        LIMIT $2
      `, [tierName, difference]);
      
      // Add the unassigned benefits
      for (const benefit of unassignedResult.rows) {
        await pool.query(`
          INSERT INTO membership_tier_benefits (tier_name, benefit_id, is_included)
          VALUES ($1, $2, true)
          ON CONFLICT DO NOTHING
        `, [tierName, benefit.id]);
      }
      
    } else {
      // Need to remove benefits (this shouldn't happen with our logic)
      console.log(`Removing ${Math.abs(difference)} benefits from ${tierName}...`);
      
      // Remove excess benefits
      const excessResult = await pool.query(`
        SELECT id
        FROM membership_tier_benefits
        WHERE tier_name = $1 AND is_included = true
        ORDER BY id DESC
        LIMIT $2
      `, [tierName, Math.abs(difference)]);
      
      for (const row of excessResult.rows) {
        await pool.query(`
          DELETE FROM membership_tier_benefits
          WHERE id = $1
        `, [row.id]);
      }
    }
  }
  
  // Final verification
  const finalResult = await pool.query(`
    SELECT 
      tier_name,
      COUNT(*) as benefit_count
    FROM membership_tier_benefits
    WHERE is_included = true
    GROUP BY tier_name
    ORDER BY 
      CASE tier_name
        WHEN 'Starter Tier' THEN 1
        WHEN 'Growth Tier' THEN 2
        WHEN 'Strategic Tier' THEN 3
        WHEN 'Patron Tier' THEN 4
        WHEN 'Partner Tier' THEN 5
      END
  `);
  
  console.log('\nFinal benefit assignments:');
  console.log('================================');
  for (const row of finalResult.rows) {
    const target = targetCounts[row.tier_name];
    const status = row.benefit_count == target ? '✓' : '✗';
    console.log(`${status} ${row.tier_name}: ${row.benefit_count} benefits (target: ${target})`);
  }
}

// Run the assignment
assignBenefitsToTiers();