<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{{ $title ?? 'SGIPC' }}</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0f1729;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 0 32px;text-align:center;">
              <div style="display:inline-block;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#00D4FF;">SGIPC</div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">Special Group Interested in Programming Contest · KUET</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px 32px;color:#e2e8f0;line-height:1.6;font-size:15px;">
              {{ $slot ?? '' }}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e293b;color:#64748b;font-size:12px;text-align:center;">
              © {{ date('Y') }} SGIPC Club · KUET CSE · This is an automated message.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
