# AJM Kooheji Group - Supply Chain Dashboard: SharePoint Deployment Guide

## Overview

This document provides step-by-step instructions for deploying the Supply Chain Dashboard on SharePoint Online. The system consists of two components:

1. **SC_Dashboard_Input.xlsx** — Excel workbook where the supply chain team enters daily data (purchases, shipments, escalations)
2. **SC_Dashboard_SharePoint.html** — Self-contained HTML dashboard that reads from the Excel file and renders interactive visualizations

The dashboard supports 8 divisions: Delmon Furniture Factory, Motor & Marine Division, Home Appliances Distribution, Home Appliances Service Center, Tire & Allied Business, AJK Unity, Pearl Craft, plus a Consolidated View for the Head of Supply Chain.

---

## Prerequisites

- SharePoint Online access (Microsoft 365)
- Site Collection Administrator or Site Owner permissions on the target SharePoint site
- The two deployment files:
  - `SC_Dashboard_Input.xlsx`
  - `SC_Dashboard_SharePoint.html`

---

## Step 1: Create a SharePoint Site (if not existing)

If a dedicated Supply Chain site does not already exist:

1. Go to `https://yourcompany.sharepoint.com`
2. Click **+ Create site**
3. Choose **Team site**
4. Name: `Supply Chain`
5. Privacy: Private (only members can access)
6. Add the supply chain team members as Owners or Members
7. Add division heads as Members or Visitors (read-only)

If you already have a SharePoint site for Supply Chain operations, use that.

---

## Step 2: Create a Document Library for Dashboard Files

1. Navigate to your SharePoint site
2. Click **+ New** > **Document library**
3. Name: `SC Dashboard`
4. Description: `Supply Chain Dashboard data and application files`
5. Click **Create**

---

## Step 3: Upload the Files

1. Open the `SC Dashboard` document library
2. Click **Upload** > **Files**
3. Select and upload both files:
   - `SC_Dashboard_Input.xlsx`
   - `SC_Dashboard_SharePoint.html`
4. Wait for upload to complete

---

## Step 4: Enable Versioning on the Excel File

This creates a daily audit trail of changes:

1. In the `SC Dashboard` library, click the **gear icon** (top right) > **Library settings**
2. Click **Versioning settings**
3. Set:
   - **Require content approval**: No
   - **Create a version each time you edit a file**: Yes, create major versions
   - **Keep the following number of major versions**: 365 (one year of daily versions)
4. Click **OK**

---

## Step 5: Set Permissions

### Supply Chain Team (Edit access to Excel)
1. Navigate to the `SC Dashboard` library
2. Click **gear icon** > **Library settings** > **Permissions for this document library**
3. If inheriting permissions, click **Stop Inheriting Permissions**
4. Click **Grant Permissions**
5. Add supply chain team members (Ahmed, Fatima, Hassan, Sara, Mohammed, Layla)
6. Set permission level: **Edit**

### Division Heads (Read access)
1. Click **Grant Permissions**
2. Add division head email addresses
3. Set permission level: **Read**

### Head of Supply Chain - Omar Al Kooheji (Full Control)
1. Click **Grant Permissions**
2. Add Omar's email
3. Set permission level: **Full Control**

---

## Step 6: Get the File URLs

You need the direct URL to the Excel file for the dashboard to read from it.

### Get the Excel file URL:
1. In the `SC Dashboard` library, click on `SC_Dashboard_Input.xlsx`
2. Copy the URL from the browser address bar
3. The URL format will be something like:
   ```
   https://yourcompany.sharepoint.com/sites/SupplyChain/SC%20Dashboard/SC_Dashboard_Input.xlsx
   ```
4. Save this URL — you will paste it into the dashboard

### Get the HTML dashboard URL:
1. Right-click on `SC_Dashboard_SharePoint.html`
2. Click **Copy link** or open it and copy the browser URL
3. The URL format will be something like:
   ```
   https://yourcompany.sharepoint.com/sites/SupplyChain/SC%20Dashboard/SC_Dashboard_SharePoint.html
   ```

---

## Step 7: Configure HTML Field Security

SharePoint blocks embedding by default. You need to allow your own domain:

1. Go to your SharePoint site
2. Click the **gear icon** (top right) > **Site information** > **View all site settings**
3. Under **Site Collection Administration**, click **HTML Field Security**
4. In the text box, add your SharePoint domain:
   ```
   yourcompany.sharepoint.com
   ```
5. Click **Add**
6. Click **OK**

> **Note**: If you don't see "HTML Field Security" under Site Collection Administration, you may need Site Collection Admin rights. Contact your IT administrator.

---

## Step 8: Create the Dashboard Page

1. Navigate to your SharePoint site
2. Go to **Site Pages** (or click **+ New** > **Page** from the site home)
3. Click **+ New** > **Page**
4. Choose a blank layout
5. Name the page: `Supply Chain Dashboard`
6. Click the **+** button to add a web part
7. Search for and select **Embed** web part
8. In the Embed web part properties pane (right side):
   - Paste the HTML file URL:
     ```
     https://yourcompany.sharepoint.com/sites/SupplyChain/SC%20Dashboard/SC_Dashboard_SharePoint.html
     ```
9. The dashboard should load in the embed frame
10. Click **Publish**

### Alternative: Full Page Embed
If you want the dashboard to take up the full page without SharePoint chrome:

1. Create the page as above
2. In page settings, set the layout to **Full-width** if available
3. Remove the title section to maximize dashboard space
4. The Embed web part will expand to fill the available area

---

## Step 9: Create Division-Specific Pages (Optional)

If you want each division head to have their own page:

1. Create a new page for each division (e.g., "DFF Dashboard", "Motor Marine Dashboard")
2. Add the same Embed web part with the same HTML URL
3. Each user can then select their division from the division bar at the top

Alternatively, you can create bookmarked URLs that pre-select a division by adding a URL parameter. This requires a small modification to the HTML file to read URL parameters on load.

---

## Step 10: Add to SharePoint Navigation

1. Go to your SharePoint site
2. Click **Edit** on the left navigation panel
3. Click **+ Add link**
4. Label: `Supply Chain Dashboard`
5. URL: The URL of the page you created in Step 8
6. Click **OK** > **Save**

---

## Daily Operations

### For the Supply Chain Team (Data Entry):

1. Go to the `SC Dashboard` document library
2. Click on `SC_Dashboard_Input.xlsx` to open in Excel Online (or click **Open in Desktop App** for Excel desktop)
3. Navigate to the relevant sheet:
   - **Local Purchases** — for domestic PRs
   - **International Purchases** — for overseas PRs
   - **Shipments Tracker** — for all import/export shipments
   - **Escalations & Blockers** — for issues and delays
4. Enter new records as new rows (do not overwrite old rows)
5. Use dropdown menus for all standardized fields
6. Update the **Current Stage** / **Current Status** as items progress
7. When a shipment is **Delayed**: select the status and choose the **Delay Reason** from the dropdown
8. When a shipment is **Rerouted**: set status to Rerouted, set Rerouted (Y/N) to Yes, select reason, enter new destination
9. Save the file (Ctrl+S or it auto-saves in Excel Online)

### For Dashboard Viewers:

1. Navigate to the Supply Chain Dashboard page
2. First time: paste the Excel file URL and click **Load from SharePoint**
3. The URL is saved in the browser — next time just click **Refresh Data**
4. Use the division buttons to switch views
5. Use the Project/Job filter for DFF, AJK Unity, and Pearl Craft
6. Use the Shipments tab filters (Direction, Incoterms, Delay Reason)
7. Click **Refresh Data** in the footer to reload the latest data from the Excel file

---

## Troubleshooting

### "Embedding content from this website isn't allowed"
- Go to Site Settings > HTML Field Security
- Add your SharePoint domain to the allowed list
- If you don't have access, ask your Site Collection Admin

### Dashboard shows "Connection Error"
- Make sure you are signed into SharePoint in the same browser
- Check that the Excel file URL is correct and the file exists
- Try opening the Excel URL directly in a new tab to confirm access
- If using the Embed web part, ensure the HTML file is on the same SharePoint tenant

### Excel file is locked for editing
- SharePoint Online supports co-authoring — multiple users can edit simultaneously in Excel Online
- If someone has the file open exclusively in Excel desktop, others may see a lock
- Recommend using **Excel Online** for daily data entry to avoid lock conflicts

### Data not appearing in dashboard
- Make sure data is entered in the correct sheet with the correct column headers
- Division names must match exactly (case-sensitive): Delmon Furniture Factory, Motor & Marine Division, etc.
- Stages and statuses must match the dropdown values exactly
- Check that the sheet name hasn't been renamed (must be: Local Purchases, International Purchases, Shipments Tracker, Escalations & Blockers)

### Dashboard looks small in the Embed web part
- Edit the page and select the Embed web part
- In properties, check **Resize to fit the page** option
- Set the web part to full-width column layout

---

## Excel Workbook Structure

### Sheet 1: Local Purchases (20 columns)
Date, Division, Project/Job Code, Project Name, PR Number, Item Description, Requested By, Date Raised, Category, Priority, Estimated Value (BHD), Current Stage, Assigned Buyer, Supplier Name, PO Number, PO Value (BHD), Expected Delivery Date, Actual Delivery Date, Days in Current Stage, Remarks/Blockers

### Sheet 2: International Purchases (26 columns)
Same as Local plus: Supplier Country, Incoterms, Payment Terms, Payment Status, Production Status, Ready Date

### Sheet 3: Shipments Tracker (42 columns, header on row 2)
Includes: Direction (Import/Export), Incoterms, Container quantities (20ft/40ft/40HC), LCL CBM, Packages, ETD/ETA, Current Status, Delay Reason (33 standardized reasons), Rerouted (Y/N), Reroute Reason, Rerouted To, full clearing cost breakdown (Cargo Value, Customs Duty, VAT, DO, Freight, THC, Demurrage, Other, Total)

### Sheet 4: Escalations & Blockers (13 columns)
Date, Division, Project/Job Code, Project Name, Reference, Type, Description, Impact Level, Owner, Action Required, Target Date, Status, Resolution Notes

### Sheet 5: Delay Reasons Reference
33 categorized delay reasons for reference

### Sheet 6: Project Codes
Master list of project/job codes for DFF, AJK Unity, and Pearl Craft

### Sheet 7: Instructions
User guide for the team

---

## Dropdown Fields Reference

All of the following fields use dropdown validation in the Excel file:

| Field | Values |
|-------|--------|
| Division | Delmon Furniture Factory, Motor & Marine Division, Home Appliances Distribution, Home Appliances Service Center, Tire & Allied Business, AJK Unity, Pearl Craft |
| Category | Raw Materials, Spare Parts, Consumables, Equipment/Capex, Office Supplies, Packaging, Tools, Services, Other |
| Priority | Urgent, High, Normal, Low |
| Local Stages | PR Received, Sourcing/Quotation, Pending Approval, PO Issued, Supplier Confirmation, In Transit/Out for Delivery, Received at Warehouse, Closed/Completed |
| International Stages | All local stages plus: Supplier Confirmation/PI Received, Payment Processing, Production/Manufacturing, Ready for Shipment, Booking & Documentation, In Transit (Sea/Air), Arrived at Port/Airport, Customs Clearance, Released & In Transit to Warehouse |
| Incoterms | EXW, FOB, CIF, CFR, DDP, DAP, FCA, CPT, CIP |
| Payment Terms | 100% Advance, 50/50 Before Shipment, 30/70 Against BL, LC at Sight, LC 30/60/90 Days, TT Against Documents, Open Account 30/60 Days |
| Payment Status | Not Started, Advance Paid, LC Opened, LC Amended, Partial Payment Made, Fully Paid, Payment Pending |
| Production Status | Not Started, In Production, Quality Check, Packing, Ready, N/A |
| Direction | Import, Export |
| Shipment Mode | Sea - FCL, Sea - LCL, Air, Land, Courier |
| Shipment Status | Booking Confirmed, Loaded/Departed, In Transit, Transshipment, Arrived at Port, Under Customs Clearance, Customs Cleared, In Transit to Warehouse, Delivered, Delayed, Rerouted |
| Delay Reason | 33 reasons (see Delay Reasons Reference sheet) |
| Rerouted (Y/N) | Yes, No |
| Reroute Reason | Port Congestion at Dest, Vessel Schedule Change, Weather Avoidance, Canal Closure, Security Risk, Customs Issue, Client Request, Cost Optimization, Carrier Decision, Other |
| Customs Status | Not Started, Documents Submitted, Under Review, Duty Assessment, Duty Paid, Cleared, Held/Query, N/A |
| Impact Level | Critical, High, Medium, Low |
| Escalation Type | PR Delay, PO Delay, Supplier Issue, Shipment Delay, Customs Hold, Quality Issue, Payment Issue, Warehouse Issue, Other |
| Escalation Status | Open, In Progress, Escalated, Resolved, Closed |
| Assigned Buyer | Ahmed, Fatima, Hassan, Sara, Mohammed, Layla |
| Requested By | Eng. Khalid, Mr. Ravi, Ms. Noor, Eng. Ali, Mr. Sanjay, Ms. Huda |
| Supplier Country | Bahrain, Saudi Arabia, UAE, Kuwait, Oman, Qatar, China, Japan, South Korea, Germany, Italy, India, Turkey, USA, UK, Taiwan, Malaysia, Thailand |

---

## Security Notes

- The HTML dashboard runs entirely in the browser — no data is sent to any external server
- The Excel file is read directly from SharePoint using the browser's authenticated session
- The SharePoint URL is stored in the browser's localStorage for convenience (can be cleared)
- All permissions are controlled through SharePoint's standard permission model
- The SheetJS library (xlsx.js) is loaded from cdnjs.cloudflare.com CDN for Excel parsing

---

## Future Enhancements

- Add auto-refresh on a timer (e.g., refresh data every 5 minutes)
- Create email alerts for critical escalations using Power Automate
- Add data validation rules in Power Automate to notify when shipments are delayed more than X days
- Create a mobile-optimized version for on-the-go access
- Integrate with Microsoft Teams as a tab for quick access
