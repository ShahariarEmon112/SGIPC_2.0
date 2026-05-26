<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $reason) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'SGIPC Registration Update');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rejected',
            with: [
                'name' => $this->user->name,
                'reason' => $this->reason,
            ],
        );
    }
}
