# Invoice PDF Template Editing Guide

This document outlines how to modify the invoice PDF template used by the `InvoicePdfService`.

## Template Location

The primary HTML template for generating invoice PDFs is located at:
`PROJECT_ROOT/api/templates/invoice.html`

## Editing the Template

1.  **Direct HTML/CSS Changes:**
    *   The template is a standard HTML5 file with inline CSS.
    *   You can modify the structure (HTML tags) and styling (CSS rules) directly in this file.
    *   **Issuer Information & Bank Details**: The issuer's name, address, and bank account details are now hardcoded directly into this HTML template as per the reference image. Modify them here if needed.
    *   The layout is designed for A4 paper size. Ensure your changes maintain this, or update the Puppeteer PDF generation options in `PdfService` if a different size or margin is needed.
    *   The Noto Sans JP font is embedded using `@font-face` referencing a server path. Ensure this font is available in the Docker container/server environment at the specified path (`file:///usr/share/fonts/truetype/noto/NotoSansJP-Regular.otf`).
    *   **Seal Image**: The company seal image has been removed from the template.

2.  **Placeholders (Dynamic Data):**
    *   The template uses [Handlebars](https://handlebarsjs.com/) syntax for placeholders.
    *   Data is injected into these placeholders by the `PdfService` and `InvoicePdfResolver`.
    *   Common placeholders (refer to `api/templates/invoice.html` for the full list):
        *   `{{INVOICE_NO}}`: Invoice number
        *   `{{PARTNER_NAME}}`: Client/Partner's name
        *   `{{ISSUE_DATE}}`: Date of issue (formatted as YYYY/M/D)
        *   `{{AMOUNT_YEN}}`: Total amount with Yen symbol (e.g., ¥100,000)
        *   `{{SUBJECT_TEXT}}`: Subject of the invoice (e.g., "CPCTF 2025 協賛費")
        *   `{{DUE_DATE_TEXT}}`: Payment due date (formatted as YYYY/M/D)
        *   `{{ITEM_DESCRIPTION_TEXT}}`: Description of the primary item
        *   `{{ITEM_AMOUNT_FORMATTED}}`: Formatted amount for the primary item (e.g., 100,000)
        *   `{{AMOUNT_YEN_IN_TABLE}}`: Total amount with Yen symbol for the items table footer.
        *   (Placeholders for `ISSUER_NAME`, `BANK_INFO_HTML`, and `SEAL_IMAGE_DATA_URL` are no longer used as these are hardcoded or removed).

3.  **Adding New Placeholders (for other dynamic data):**
    *   If you need to add new dynamic data (not related to issuer/bank info):
        1.  Add a new placeholder (e.g., `{{MY_NEW_DATA}}`) to `invoice.html`.
        2.  Update the `GenerateInvoicePdfInput` DTO (`api/src/invoice-pdf/dto/generate-invoice-pdf.dto.ts`) if the data comes from the GraphQL mutation.
        3.  Modify `InvoicePdfResolver` (`api/src/invoice-pdf/invoice-pdf.resolver.ts`) to pass the new data to `pdfService.generatePdfFromTemplate`.

## Testing Changes

*   After modifying the template, you can test the PDF generation by running the `generateInvoicePdf` mutation through your GraphQL client or by running the relevant unit/e2e tests.
*   Ensure the API service is restarted if you are not using a watch mode that automatically picks up template changes.

## Important Notes

*   **Fonts:** The Noto Sans JP font is critical for correct Japanese character rendering. Verify its availability in the deployment environment.
*   **Performance:** Complex HTML can impact PDF generation time. Keep the template reasonably simple for optimal performance. 