// Client invite email config, powered by EmailJS (a free service that sends
// email directly from a website with no backend server needed).
//
// 1. Go to https://www.emailjs.com and create a free account.
// 2. Under "Email Services," connect your email (Gmail, Outlook, etc.) —
//    this creates a Service ID (looks like "service_xxxxxxx").
// 3. Under "Email Templates," create a new template. Use these variable
//    names in your template so the app can fill them in:
//      {{to_name}}      — the client's name
//      {{to_email}}     — the client's email (set this as the template's "To" field)
//      {{invite_link}}  — the unique signup link the client taps
//    Example template body:
//      "Hi {{to_name}}, your trainer invited you to Xcel Online PT!
//       Tap this link to set up your account: {{invite_link}}"
//    This creates a Template ID (looks like "template_xxxxxxx").
// 4. Under "Account" -> "General," copy your Public Key.
// 5. Paste all three values below, replacing the placeholders.
//
// Until real values are entered here, invites still get saved and you can
// share the signup link yourself, but the automatic email won't send.
export const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
export const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
export const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
