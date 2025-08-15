# Companies House to MyT Automation Field Mapping

## Overview
This document shows the exact mapping between Companies House data fields and MyT Automation custom fields for business data synchronization.

## Companies House Fields Synced

### Core Company Information
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Company Name | `businessName` | Text | "Example Ltd" |
| Companies House Number | `companiesHouseNumber` | Text | "12345678" |
| Company Status | `companyStatus` | Text | "Active" / "Dormant" / "Dissolved" |
| Business Type | `businessType` | Text | "Limited Company" / "LLP" / "Sole Trader" |

### Registration Details
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Incorporation Date | `incorporationDate` | Text | "01/01/2015" |
| Registered Address | `registeredAddress` | Text | "123 High Street, London" |
| SIC Code | `sicCode` | Text | "62012" |
| VAT Number | `vatNumber` | Text | "GB123456789" |

### Filing Dates
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Accounts Filing Date | `accountsFilingDate` | Text | "31/12/2024" |
| Confirmation Statement Date | `confirmationStatementDate` | Text | "01/01/2025" |

### Financial Information
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Annual Turnover | `turnover` | Text | "£1,000,000" |
| Number of Employees | `employeeCount` | Text | "10-50" |

## How Import Works

When you import data via `/data-import`:

1. **CSV/Excel Upload**: Upload your file with Companies House data
2. **Field Mapping**: Map columns to the fields above
3. **Database Storage**: Data saved to PostgreSQL database
4. **MyT Sync**: Automatically syncs ALL fields to MyT Automation

## CSV Template Columns

The downloadable CSV template includes these Companies House columns:
- Companies House Number
- SIC Code  
- VAT Number
- Registered Address
- Incorporation Date
- Accounts Filing Date
- Confirmation Statement Date
- Company Status
- Business Type
- Annual Turnover

## Testing the Sync

To verify Companies House data is syncing:

1. Go to `/data-import`
2. Download the CSV template
3. Fill in your business data including Companies House fields
4. Upload and map the fields
5. Check MyT Automation contacts - all custom fields should be populated

## Required MyT Custom Fields

Ensure these custom fields exist in MyT Automation:
- `companiesHouseNumber` (Text)
- `sicCode` (Text)
- `vatNumber` (Text)
- `registeredAddress` (Text)
- `incorporationDate` (Text)
- `accountsFilingDate` (Text)
- `confirmationStatementDate` (Text)
- `companyStatus` (Text)
- `businessType` (Text)
- `turnover` (Text)
- `employeeCount` (Text)

## Import Sources

Companies House data can come from:
- Direct Companies House API exports
- Manual CSV compilation
- Third-party business databases
- Your existing CRM exports

## Notes

- All Companies House fields are optional - blank fields won't cause import failures
- Dates can be in various formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
- Company numbers should be 8 digits (leading zeros included)
- VAT numbers should include the GB prefix
- Turnover can include currency symbols