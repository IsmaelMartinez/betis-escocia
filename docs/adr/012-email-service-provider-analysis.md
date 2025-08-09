# ADR-012: Email Service Provider Analysis

## Status
- **Status**: Decommissioned/Removed
- **Date**: 2025-08-09 (Date of decommissioning)
- **Authors**: Gemini CLI
- **Decision Maker**: User
- **Note**: This ADR is decommissioned as the email notification system has been removed from the project.

## Context
The current email notification service (`src/lib/emailService.ts`) uses Resend for sending transactional emails (RSVP and contact notifications). The user has requested an analysis of the current provider against other free/low-volume alternatives, with a focus on identifying the most suitable option for extremely limited load while remaining free. The current implementation relies on an `EMAIL_API_KEY` environment variable, implying a third-party service.

## Decision
To analyze and compare various email service providers, including the currently used Resend, based on their free tier offerings, suitability for transactional emails, and ease of integration, to determine the most cost-effective and reliable solution for low-volume email notifications.

## Consequences
### Positive
- Identification of the most suitable free email service provider for current and anticipated low-volume needs.
- Potential cost savings by optimizing for free tiers.
- Improved understanding of email service provider landscape for future scalability.

### Negative
- Time investment in research and analysis.
- Potential migration effort if a different provider is chosen.

### Neutral
- The core email service logic in `src/lib/emailService.ts` is abstracted, making provider changes relatively straightforward.

## Alternatives Considered

### Current Provider: Resend
- **Pros**:
    - Currently integrated and functional.
    - Simple API for sending emails.
- **Cons**:
    - Free tier limits are not explicitly stated in the current implementation, requiring external verification.
    - May not be the most generous free tier compared to alternatives.
- **Reason for rejection**: Not rejected, but needs comparison to ensure it's the optimal free solution.

### Option 1: Brevo (formerly Sendinblue)
- **Pros**:
    - Generous free tier: up to 300 emails per day (approx. 9,000/month).
    - Good for transactional emails.
    - Offers SMTP and API.
- **Cons**:
    - May require a new API integration if not compatible with current `fetch` structure.
- **Reason for rejection**: Pending comparison.

### Option 2: SendGrid
- **Pros**:
    - Free tier: up to 100 emails per day.
    - Widely used, robust, and reliable.
    - Offers SMTP and API.
- **Cons**:
    - Lower free tier limit compared to Brevo.
- **Reason for rejection**: Pending comparison.

### Option 3: Mailgun
- **Pros**:
    - Free tier: up to 100 emails per day.
    - Good for transactional emails.
    - Offers SMTP and API.
- **Cons**:
    - Lower free tier limit compared to Brevo.
- **Reason for rejection**: Pending comparison.

### Option 4: Postmark
- **Pros**:
    - Free tier: up to 100 emails per month.
    - Known for excellent deliverability for transactional emails.
- **Cons**:
    - Very low free tier limit, likely insufficient even for extremely limited load.
- **Reason for rejection**: Pending comparison.

### Option 5: Amazon SES (Simple Email Service)
- **Pros**:
    - Very cost-effective, generous free tier (3,000 messages for 12 months, or 62,000/month if from EC2).
    - Highly scalable.
- **Cons**:
    - More complex setup and configuration (AWS ecosystem).
    - May require AWS SDK integration instead of simple HTTP `fetch`.
- **Reason for rejection**: Pending comparison.

### Option 6: MailerSend
- **Pros**:
    - Free plan: up to 3,000 emails per month.
- **Cons**:
    - Less widely known than some alternatives.
- **Reason for rejection**: Pending comparison.

### Option 7: Zoho ZeptoMail
- **Pros**:
    - Free tier: 10,000 emails.
- **Cons**:
    - Less widely known than some alternatives.
- **Reason for rejection**: Pending comparison.

### Option 8: SMTP2GO
- **Pros**:
    - Free plan: up to 1,000 emails per month.
- **Cons**:
    - Lower free tier limit.
- **Reason for rejection**: Pending comparison.

### Option 9: Mailtrap
- **Pros**:
    - Free tier: 1,000 emails per month.
- **Cons**:
    - Primarily known for email testing, not production sending.
- **Reason for rejection**: Pending comparison.

### Option 10: Aha Send
- **Pros**:
    - Free for up to 1,000 emails per month.
- **Cons**:
    - Less information available, potentially newer/smaller provider.
- **Reason for rejection**: Pending comparison.

## Implementation Notes
The `EmailService` class in `src/lib/emailService.ts` is designed to be somewhat provider-agnostic, using a generic `fetch` call to an API endpoint. If a new provider is chosen, the `sendRSVPNotification` and `sendContactNotification` methods would need to be updated to reflect the new API endpoint, headers, and body format.

## References
- `src/lib/emailService.ts`
- Web search results for "free email service providers for transactional emails low volume"

## Review
- **Next review date**: 2025-09-01
- **Review criteria**: Decision on the optimal email service provider based on free tier limits, reliability, and ease of integration.
