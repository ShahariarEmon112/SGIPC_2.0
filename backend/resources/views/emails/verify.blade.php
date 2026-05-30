@component('emails._layout', ['title' => 'Verify your SGIPC email'])
<h2 style="margin:0 0 12px 0;font-size:22px;color:#ffffff;">Welcome, {{ $name }}!</h2>
<p style="margin:0 0 16px 0;">Thanks for registering with the SGIPC Club at KUET. Enter the 6-digit code below on the verification page to confirm this email belongs to you.</p>
<div style="margin:24px 0;padding:18px 24px;background:#0a0e1a;border:1px solid #1f2937;border-radius:10px;text-align:center;">
  <div style="font-family:'Courier New',monospace;font-size:34px;letter-spacing:10px;color:#00D4FF;font-weight:700;">{{ $code }}</div>
</div>
<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">This code expires in 15 minutes. If it expires, request a new one from the verification page.</p>
<p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">After verification, an SGIPC admin will review your application. You'll get another email once your account is approved.</p>
@endcomponent
