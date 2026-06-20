# Security Specification - Alpha Women Elevates

## Data Invariants
- A user profile must belong to the authenticated user.
- Membership tiers and subscription status are protected and can only be modified by admins or system processes.
- Events and Products are public for reading but only manageable by Admins.
- Registrations must be linked to a valid event and the authenticated user.

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` on own profile.
3. **Ghost Field Injection**: Attempt to add `isVerified: true` to a product.
4. **ID Poisoning**: Use a 2KB string as a product ID.
5. **PII Breach**: Authenticated user 'A' attempts to 'get' private data of user 'B'.
6. **State Skip**: Attempt to set `status: 'delivered'` on a new order (if orders existed).
7. **Resource Exhaustion**: Use a very long string for `fullName`.
8. **Orphaned Registration**: Register for an event ID that doesn't exist.
9. **Timestamp Spoofing**: Provide a `createdAt` from the past instead of `request.time`.
10. **Membership Fraud**: Self-assign `membershipTier: 'gold'`.
11. **Admin Impersonation**: Attempt to delete an event as a non-admin.
12. **Query Scraping**: Attempt `collection('users').get()` without a filter.
