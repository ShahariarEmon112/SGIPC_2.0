@component('emails._layout', ['title' => 'Welcome to SGIPC'])
<h2 style="margin:0 0 12px 0;font-size:22px;color:#ffffff;">You're in, {{ $name }}!</h2>
<p style="margin:0 0 16px 0;">Your SGIPC membership has been approved. Welcome to the KUET competitive programming community.</p>
<p style="margin:0 0 24px 0;">
  <a href="{{ $loginUrl }}" style="display:inline-block;background:#00D4FF;color:#0a0e1a;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">Log in to your account</a>
</p>
<p style="margin:0 0 8px 0;">Next steps:</p>
<ul style="margin:0 0 16px 20px;padding:0;color:#cbd5e1;">
  <li style="margin-bottom:6px;">Join our next weekly contest on Codeforces.</li>
  <li style="margin-bottom:6px;">Browse achievements and blog posts from senior members.</li>
  <li>Update your profile with a photo so teammates can recognize you.</li>
</ul>
<p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">Code. Compete. Conquer.</p>
@endcomponent
