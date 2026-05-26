@component('emails._layout', ['title' => 'SGIPC Registration Update'])
<h2 style="margin:0 0 12px 0;font-size:22px;color:#ffffff;">Update on your SGIPC application</h2>
<p style="margin:0 0 16px 0;">Hi {{ $name }},</p>
<p style="margin:0 0 16px 0;">After review, we are unable to approve your SGIPC membership at this time.</p>
<div style="background:#1e1b3a;border-left:3px solid #f87171;padding:14px 18px;border-radius:6px;margin:0 0 16px 0;">
  <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Reason</div>
  <div style="color:#fecaca;">{{ $reason }}</div>
</div>
<p style="margin:0 0 8px 0;">If you believe this was an error or you'd like to reapply with corrected information, reply to this email and an admin will review your case.</p>
<p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">SGIPC Club · KUET</p>
@endcomponent
