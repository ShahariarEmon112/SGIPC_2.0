<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome to SGIPC! Your account is approved');
    }

    public function content(): Content
    {
        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        return new Content(
            view: 'emails.approved',
            with: [
                'name' => $this->user->name,
                'loginUrl' => $frontend.'/login',
            ],
        );
    }
}
