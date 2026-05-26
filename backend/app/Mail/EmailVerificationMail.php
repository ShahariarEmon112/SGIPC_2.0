<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $token) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Verify your SGIPC email');
    }

    public function content(): Content
    {
        $frontend = rtrim(config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $verifyUrl = $frontend.'/verify-email?token='.urlencode($this->token);

        return new Content(
            view: 'emails.verify',
            with: [
                'name' => $this->user->name,
                'verifyUrl' => $verifyUrl,
            ],
        );
    }
}
