import express from 'express';
import db from '../db.js';
import { sendEmail } from '../utils/mailer.js';

const router = express.Router();
// POST /api/events/register
router.post('/register', async (req, res) => {
  const { eventId, eventTitle, eventPrice, name, surname, email } = req.body;

  try {
    // -------------------------------------------------------------------
    // STEP 1: Check if the user is an official registered platform member
    // -------------------------------------------------------------------
    const memberCheck = await db.query('SELECT id FROM members WHERE email = $1', [email]);
    const isRegisteredMember = memberCheck.rows && memberCheck.rows.length > 0;

    // -------------------------------------------------------------------
    // STEP 2: Duplicate Check for Event Registration
    // We check if this specific email already booked THIS specific event.
    // -------------------------------------------------------------------
    const existingRegistration = await db.query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [eventId, email]
    );

    if (existingRegistration.rows.length > 0) {
      // Return early so we DON'T process another registration or send duplicate emails
      return res.status(400).json({ 
        error: 'You have already registered for this event! Check your email inbox for your ticket.' 
      });
    }

    // -------------------------------------------------------------------
    // STEP 3: Record the new event booking in the database
    // -------------------------------------------------------------------
    await db.query(
      `INSERT INTO event_registrations (event_id, first_name, last_name, email, created_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [eventId, name, surname, email]
    );

    // -------------------------------------------------------------------
    // STEP 4: Send Notification Email to Admin (Tersh)
    // -------------------------------------------------------------------
    await sendEmail({
      to: 'tersh@alphawomenelevates.com',
      subject: `New Event Booking: ${eventTitle}`,
      html: `
        <h3>Event Booking Alert</h3>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Attendee:</strong> ${name} ${surname} (${email})</p>
        <p><strong>Membership Status:</strong> ${isRegisteredMember ? '✅ Registered Member' : '⚠️ Non-Member / Guest'}</p>
      `
    });

    // -------------------------------------------------------------------
    // STEP 5: Send Ticket Email to Attendee
    // -------------------------------------------------------------------
    await sendEmail({
      to: email,
      subject: `Your Event Entry Pass - ${eventTitle}`,
      html: `
        <h2>Event Ticket Confirmation</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering for <strong>${eventTitle}</strong>.</p>
        <p>Please present this confirmation email upon arrival.</p>
      `
    });

    // -------------------------------------------------------------------
    // STEP 6: Respond to Frontend
    // Send success status & membership flag to control post-booking popups
    // -------------------------------------------------------------------
    res.json({ success: true, isRegisteredMember });

  } catch (err) {
    console.error('Event registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to process event registration.' });
  }
});

export default router;