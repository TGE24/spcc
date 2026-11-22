# Supabase Auth email templates

Branded versions of the emails Supabase Auth sends. They match the Resend
emails in `src/lib/email-templates.ts`, so keep the two in step.

Supabase doesn't read these files. To use one, copy it into
**Authentication → Emails → Templates** in the Supabase dashboard: paste the
subject from the comment at the top of the file, then everything from
`<!DOCTYPE html>` down into the message body.

| File | Dashboard template | Subject | Used by this site? |
|---|---|---|---|
| `reset-password.html` | Reset Password | Reset your St. Patrick's staff password | Yes: "Forgot password?" on `/login` |
| `invite-user.html` | Invite user | You've been invited to the St. Patrick's staff area | When you use **Invite user** in Supabase |
| `change-email.html` | Change Email Address | Confirm your new email address | If a staff email is changed |
| `reauthentication.html` | Reauthentication | Your St. Patrick's verification code | Not yet |
| `magic-link.html` | Magic Link | Your St. Patrick's sign-in link | Not yet |
| `confirm-signup.html` | Confirm signup | Confirm your email for St. Patrick's | Not yet (there's no public sign-up) |

## How the links work

The button links point straight at the site, not at Supabase's default
redirect:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/login/reset
```

`src/app/auth/confirm/route.ts` checks the token, signs the person in, and
sends them to `next`. This works on any device, even if the email is opened
somewhere other than where the reset was requested. Reset and invite links
both land on `/login/reset` to choose a password.

**Site URL** (Authentication → URL Configuration) must be the live site, since
it's used for both the links and the logo image.

The parish address, phone and email in the footers are copied from
`src/lib/site-config.ts`. Update the templates if those change.
