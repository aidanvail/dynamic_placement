# Placement Dynamics direct CV application email service

This is a standalone service. The existing Placement Dynamics website, Airtable vacancy listing, historic applications and contact form are intentionally untouched.

## Why this exists

The former Airtable attachment-upload application flow hit Airtable's attachment storage limit. An Airtable native attachment field always uploads into Airtable first, so sending an automation email afterwards does not solve that problem. This service receives files in memory, emails them to the recruiter, and never writes application records or attachments to Airtable, a database or local disk.

## How the candidate flow works

1. The Airtable vacancy listing shows an **Apply** link to this service at \`https://apply.placedynamics.co.za/?job=JOB_REFERENCE\`. The candidate remains free to browse vacancies in the existing website embed.
2. The candidate provides full name, email, optional phone, the job title/reference, CV and head-and-shoulders photo. They accept application data processing and pass a Turnstile anti-bot check.
3. The server validates the fields and files and sends an email **to \`liesel@placedynamics.co.za\`**, with both attachments and the candidate email as \`Reply-To\`. No candidate email program is opened.
4. Success appears **only after** the mail server has accepted the email for delivery. Confirm actual inbox delivery, including spam filters, separately.

## Deploy to the existing VPS (not live yet)

- Use a Node.js 22 environment and an HTTPS reverse proxy such as existing Traefik. Only expose port 3000 to the internal proxy network.
- Create the \`apply.placedynamics.co.za\` DNS record and HTTPS proxy route; do not alter the primary website or its jobs embed.
- Copy \`.env.example\` to a private \`.env\` on the VPS. Configure legitimate sender SMTP credentials, an SPF/DKIM-aligned sender, the fixed recruitment inbox, and Cloudflare Turnstile public and secret keys. **Never commit actual secrets.**
- Run \`npm install\`, then \`npm run check\` and \`npm start\`, or build/run the provided Dockerfile/Compose example with the VPS proxy configuration.
- Test HTTPS, Turnstile, and SMTP with **synthetic applicant details and harmless test PDF/photo files** before updating any public Apply links. Verify attachments actually reach the target inbox. Test rejects for invalid/missing files, 6MB limits, retryable SMTP failure, and rate-limit behavior.
- In Airtable, replace each **Apply** action/link on the embedded vacancy list with a URL to \`https://apply.placedynamics.co.za/?job=<URL-encoded job title or reference>\`. Keep the existing vacancy records and listing intact. Hide/retire native attachment-upload application links only **after** new link testing is successful.
- Ensure old direct links to Airtable upload forms are updated wherever shared (posts, vacancy pages, QR codes), or candidates will still encounter the attachment-limit error.

## Behaviour and privacy

- All application data is used transiently in server memory; the service does not store it, and no applicant data is logged. The mail server and receiving mailbox will retain emails in accordance with their own policies.
- Attachments are limited to 6MB each. CVs: PDF, DOCX or DOC. Photos: JPG or PNG. File signatures are checked, but **this is not antivirus scanning**. Consider malware scanning on the recipient mail system.
- Application success means SMTP accepted the mail, **not** proof that Liesl has read or received it in Inbox. Configure mailbox delivery monitoring, SPF, DKIM and DMARC.
- Cloudflare Turnstile verification is mandatory; no insecure unprotected production mode.
- Rate limits are local to the running process. Run one app instance, or add a shared rate-limit store before horizontal scaling.
- The server has no durable retry queue because the requirement is to avoid permanent CV storage. Failed sends return a clear retryable error rather than claiming success.
- Verify the website's POPIA notices, recruitment retention policy, vendor/data-processing agreements, and candidate consent language before production use.
- Do not set the service's SMTP \`From\` header to the candidate. Only the server-owned sender is used; candidate email is the \`Reply-To\` header.

## Current blockers

This repository branch alone does not change the live website or existing Airtable form, and does not send any live application email. Requires VPS/proxy/DNS/SMTP/Turnstile configuration, Airtable edit access, an end-to-end synthetic test, and explicit publication of the new Apply links.

## Safety

Any attachment may contain malware. Do not open untrusted attachments on an unprotected workstation. The client must be instructed to review application attachments with their normal mail security protections.
