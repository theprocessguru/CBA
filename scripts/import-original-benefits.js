// Script to import all the original 230+ benefits from membershipTiers.ts into the database
import { readFileSync } from 'fs';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Function to convert camelCase to readable title
function camelToTitle(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Function to get category from comment or infer from benefit name
function getCategory(benefitName, comment) {
  if (comment.includes('MyT Accounting')) return 'accounting';
  if (comment.includes('MyT AI')) return 'ai_services';
  if (comment.includes('MyT Automation')) return 'automation';
  if (comment.includes('Directory & Visibility')) return 'directory';
  if (comment.includes('Networking & Events')) return 'networking';
  if (comment.includes('Business Support')) return 'support';
  if (comment.includes('Marketing & Promotion')) return 'marketing';
  if (comment.includes('Training & Development')) return 'training';
  if (comment.includes('Communication & Support')) return 'communication';
  if (comment.includes('Digital & Technology')) return 'technology';
  if (comment.includes('Financial & Discounts')) return 'financial';
  if (comment.includes('Special Access')) return 'access';
  if (comment.includes('AI Support')) return 'ai_services';
  
  // Infer from benefit name
  const name = benefitName.toLowerCase();
  if (name.includes('ai') || name.includes('myt')) return 'ai_services';
  if (name.includes('network') || name.includes('event')) return 'networking';
  if (name.includes('marketing') || name.includes('promotion')) return 'marketing';
  if (name.includes('support') || name.includes('consultation')) return 'support';
  if (name.includes('training') || name.includes('development')) return 'training';
  if (name.includes('directory') || name.includes('listing')) return 'directory';
  if (name.includes('communication') || name.includes('email')) return 'communication';
  if (name.includes('technology') || name.includes('digital')) return 'technology';
  if (name.includes('financial') || name.includes('discount')) return 'financial';
  if (name.includes('access') || name.includes('exclusive')) return 'access';
  if (name.includes('accounting')) return 'accounting';
  if (name.includes('automation')) return 'automation';
  
  return 'other';
}

// Function to generate description from benefit name
function generateDescription(benefitName) {
  const name = camelToTitle(benefitName);
  
  // Special cases for better descriptions
  const descriptions = {
    'Enhanced Listing': 'Premium placement in the member directory with enhanced visibility',
    'Featured Placement': 'Top-tier featured placement in directory and promotional materials',
    'Premium Badge': 'Exclusive premium member badge and verification status',
    'Search Priority': 'Higher ranking in directory search results',
    'Homepage Feature': 'Featured placement on association homepage',
    'Logo In Directory': 'Display your business logo in the member directory',
    'Multiple Photos': 'Upload multiple photos to showcase your business',
    'Video Profile': 'Add video content to your business profile',
    'Networking Events': 'Access to regular networking events and meetups',
    'Exclusive Events': 'Invitation to members-only exclusive events',
    'VIP Event Access': 'VIP access and priority seating at events',
    'Event Hosting': 'Opportunities to host your own events through the association',
    'Speaking Opportunities': 'Platform to speak at association events and conferences',
    'Board Meeting Access': 'Access to board meetings and strategic discussions',
    'Executive Networking': 'Exclusive networking with senior executives and business leaders',
    'Monthly Meetings': 'Participation in monthly member meetings',
    'Quarterly Gatherings': 'Access to quarterly business gatherings and socials',
    'Annual Conference': 'Complimentary access to the annual business conference',
    'Business Consultation': 'Professional business consultation and strategic advice',
    'Mentoring Access': 'Access to experienced business mentors and advisors',
    'Legal Support': 'Legal advice and support for business matters',
    'Accounting Support': 'Professional accounting and bookkeeping assistance',
    'HR Support': 'Human resources guidance and employment law advice',
    'Marketing Consultation': 'Expert marketing strategy and campaign consultation',
    'Digital Marketing Support': 'Digital marketing tools and campaign management',
    'Website Support': 'Website development and maintenance assistance',
    'SEO Support': 'Search engine optimization services and guidance',
    'Social Media Support': 'Social media strategy and content management',
    'Business Plan Support': 'Professional business plan development and review',
    'Financial Planning Support': 'Financial planning and investment guidance',
    'Compliance Support': 'Regulatory compliance assistance and monitoring',
    'Tax Support': 'Tax preparation and planning services',
    'Insurance Guidance': 'Business insurance advice and policy optimization'
  };
  
  return descriptions[name] || `Access to ${name.toLowerCase()} services and benefits`;
}

async function importBenefits() {
  try {
    // Clear existing benefits
    await pool.query('DELETE FROM benefits');
    console.log('Cleared existing benefits');
    
    // Read the membershipTiers.ts file
    const fileContent = readFileSync('./shared/membershipTiers.ts', 'utf8');
    
    // Extract benefit properties from the benefits interface
    const benefitMatches = fileContent.match(/^\s*(\w+):\s*(boolean|number);.*$/gm);
    
    if (!benefitMatches) {
      console.error('Could not find benefit properties in membershipTiers.ts');
      return;
    }
    
    let sortOrder = 1;
    const benefits = [];
    
    // Parse each benefit
    for (const match of benefitMatches) {
      const [, benefitName, type] = match.match(/^\s*(\w+):\s*(boolean|number);/) || [];
      
      if (!benefitName || benefitName === 'aiCredits') continue; // Skip aiCredits as it's a number
      
      // Find the comment above this benefit to determine category
      const lines = fileContent.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${benefitName}:`));
      
      let category = 'other';
      let comment = '';
      
      // Look for comment in previous lines
      for (let i = lineIndex - 1; i >= 0 && i >= lineIndex - 5; i--) {
        const line = lines[i].trim();
        if (line.startsWith('//')) {
          comment = line;
          category = getCategory(benefitName, comment);
          break;
        }
      }
      
      const name = camelToTitle(benefitName);
      const description = generateDescription(benefitName);
      
      benefits.push({
        name,
        description,
        category,
        isActive: true,
        sortOrder: sortOrder++
      });
    }
    
    // Insert benefits in batches
    console.log(`Importing ${benefits.length} benefits...`);
    
    for (const benefit of benefits) {
      await pool.query(
        'INSERT INTO benefits (name, description, category, is_active, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [benefit.name, benefit.description, benefit.category, benefit.isActive, benefit.sortOrder]
      );
    }
    
    console.log(`Successfully imported ${benefits.length} benefits!`);
    
    // Show summary by category
    const result = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM benefits 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('\nBenefits by category:');
    for (const row of result.rows) {
      console.log(`${row.category}: ${row.count} benefits`);
    }
    
  } catch (error) {
    console.error('Error importing benefits:', error);
  } finally {
    await pool.end();
  }
}

importBenefits();