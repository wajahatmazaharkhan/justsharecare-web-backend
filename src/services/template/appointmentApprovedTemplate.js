export const appointmentApprovedTemplate = (
  name,
  email,
  counsellorName,
  date,
  time
) => `<!DOCTYPE html>
<html>
<body>
  <h2>Appointment Confirmed</h2>
  <p>Hello ${name.toLowerCase()},</p>
  <p>Your session with <strong>${counsellorName.toLowerCase()}</strong> is confirmed.</p>
  <p>Date: ${date}<br/>Time: ${time}</p>
</body>
</html>`;
