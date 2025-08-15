# Companies House to MyT Automation Field Mapping

## Overview
This document shows the exact mapping between Companies House data fields and MyT Automation custom fields for business data synchronization.

## Companies House Fields Synced

### Core Company Information (Exact CH Field Names)
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Company Name | `name` | Text | "Example Ltd" |
| Company Number | `company_number` | Text | "12345678" |
| Company Status | `company_status` | Text | "active" / "dormant" / "dissolved" |
| Company Type | `company_type` | Text | "ltd" / "llp" / "plc" |

### Registration Details
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Date of Creation | `date_of_creation` | Text | "2015-01-01" |
| Registered Office Address | `registered_office_address` | Text | "123 High Street, London, SW1A 1AA" |
| SIC Codes | `sic_codes` | Text | "62012, 62020" |
| Jurisdiction | `jurisdiction` | Text | "england-wales" |

### Filing Dates
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Accounting Reference Date | `accounting_reference_date` | Text | "31-12" |
| Confirmation Statement | `confirmation_statement_last_made_up_to` | Text | "2025-01-01" |

### Additional Fields
| Data Field | MyT Custom Field Name | Type | Example |
|------------|----------------------|------|---------|
| Has Been Liquidated | `has_been_liquidated` | Boolean | false |
| Has Insolvency History | `has_insolvency_history` | Boolean | false |
| VAT Number | `vat_number` | Text | "GB123456789" |

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