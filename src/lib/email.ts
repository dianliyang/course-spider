import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface StudyReminderEmailData {
  recipientEmail: string;
  recipientName: string;
  courses: Array<{
    title: string;
    courseCode: string;
    university: string;
    durationMinutes: number;
    location?: string;
    startTime?: string;
  }>;
  date: string;
}

export async function sendStudyReminderEmail(data: StudyReminderEmailData) {
  const { recipientEmail, recipientName, courses, date } = data;
  
  const totalMinutes = courses.reduce((sum, c) => sum + c.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 48px 24px; }
    .logo { color: #000000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 40px; }
    .dot { color: #3b82f6; }
    .content { background-color: #fcfcfc; border: 1px solid #f0f0f0; padding: 48px; border-radius: 24px; }
    h1 { font-size: 22px; font-weight: 900; color: #111827; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em; }
    p { color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
    .button { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; padding: 20px 40px; border-radius: 12px; text-decoration: none; text-align: center; }
    .divider { height: 1px; background-color: #eeeeee; margin: 40px 0; }
    .footer { margin-top: 40px; text-align: center; }
    .footer-text { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; }
    .security { font-size: 12px; color: #9ca3af; line-height: 1.5; }
    
    /* Study Schedule Specific */
    .schedule-card { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .course-item { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
    .course-item:last-child { border-bottom: none; padding-bottom: 0; }
    .course-item:first-child { padding-top: 0; }
    .course-title { font-weight: 800; color: #111827; font-size: 14px; margin-bottom: 4px; }
    .course-meta { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; display: flex; gap: 8px; align-items: center; }
    .date-banner { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CodeCampus<span class="dot">.</span></div>
    <div class="content">
      <div class="date-banner">${date}</div>
      <h1>Time to Learn, ${recipientName.split(' ')[0]}</h1>
      <p>You have <strong>${courses.length} sessions</strong> scheduled for today, totaling ${totalHours} hours of focused work.</p>
      
      <div class="schedule-card">
        ${courses.map(c => `
        <div class="course-item">
          <div class="course-title">${c.title}</div>
          <div class="course-meta">
            ${c.startTime ? `<span>${c.startTime}</span> // ` : ''}
            <span>${c.courseCode}</span> // 
            <span>${c.university}</span> // 
            <span>${c.durationMinutes}m</span>
            ${c.location ? ` // <span>${c.location}</span>` : ''}
          </div>
        </div>
        `).join('')}
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/study-plan" class="button">Start Session</a>
      
      <div class="divider"></div>
      <div class="security">
        <strong>Daily Insight:</strong> Consistency is the key to mastery. Even a partial session is better than none. Keep your momentum going.
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© 2026 CodeCampus Global Network // 0xFC</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `📚 Today's Study Plan: ${courses.length} course${courses.length > 1 ? 's' : ''} scheduled`,
      html,
    });

    if (error) {
      console.error(`❌ Failed to send email to ${recipientEmail}:`, error);
      return { success: false, error };
    }

    console.log(`✅ Study reminder sent to ${recipientEmail}`, emailData);
    return { success: true, id: emailData?.id };
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipientEmail}:`, error);
    return { success: false, error };
  }
}
