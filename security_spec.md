# Health Guardian Security Specification

## Data Invariants
1. A User document can only be created by the owner (uid matching request.auth.uid).
2. Health profiles belong to specific users and are only accessible by the owner.
3. Medication schedules are private and only modifiable by the owner.
4. SOS Alerts are public for reading during emergency but only createable by the user in distress.
5. Location data is shared with friends.

## The "Dirty Dozen" Payloads
1. Attempt to create a user profile with a different UID.
2. Attempt to read someone else's health profile.
3. Attempt to update someone else's medication schedule.
4. Attempt to delete an SOS alert created by another user.
5. Attempt to update a community post as another user.
6. Attempt to inject a massive string into a medicine name field.
7. Attempt to set `isVerified` on an emergency contact without being an admin.
8. Attempt to resolve an SOS alert that doesn't belong to the user.
9. Attempt to read private chat messages between two other users.
10. Attempt to create a community post with a future timestamp.
11. Attempt to update an immutable `createdAt` field.
12. Attempt to join a friendship without being the recipient.

## Test Runner (Planned)
- Verify PERMISSION_DENIED for all unauthorized operations.
