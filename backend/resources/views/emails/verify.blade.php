@component('emails._layout', ['title' => 'Verify your SGIPC email'])
<h2 style="margin:0 0 12px 0;font-size:22px;color:#ffffff;">Welcome, {{ $name }}!</h2>
<p style="margin:0 0 16px 0;">Thanks for registering with the SGIPC Club at KUET. One last step — confirm this email belongs to you.</p>
<p style="margin:0 0 24px 0;">
  <a href="{{ $verifyUrl }}" style="display:inline-block;background:#00D4FF;color:#0a0e1a;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify my email</a>
</p>
<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">If the button does not work, paste this link into your browser:</p>
<p style="margin:0 0 16px 0;font-size:13px;color:#00D4FF;word-break:break-all;">{{ $verifyUrl }}</p>
<p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">After verification, an SGIPC admin will review your application. You'll get another email once your account is approved.</p>
@endcomponent
