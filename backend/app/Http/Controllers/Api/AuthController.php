<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\ApiResponse;
use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $token = bin2hex(random_bytes(32));

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'student_id' => $data['student_id'],
            'batch' => $data['batch'],
            'department' => $data['department'] ?? 'CSE',
            'password' => Hash::make($data['password']),
            'role' => 'client',
            'status' => 'pending',
            'email_verification_token' => $token,
        ]);

        Mail::to($user->email)->queue(new EmailVerificationMail($user, $token));

        return $this->ok(
            ['user_id' => $user->id],
            'Registration successful. Check your email to verify your address.'
        );
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $token = (string) $request->query('token', '');
        if ($token === '') {
            return $this->fail('Missing verification token.', ['code' => 'missing_token'], 422);
        }

        $user = User::where('email_verification_token', $token)->first();
        if (! $user) {
            return $this->fail('Invalid or expired verification token.', ['code' => 'invalid_token'], 422);
        }

        if ($user->email_verified_at) {
            return $this->ok(
                ['already_verified' => true],
                'Email already verified.'
            );
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_token' => null,
        ])->save();

        return $this->ok(
            ['status' => $user->status],
            'Email verified. Your account is pending admin approval.'
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return $this->fail('Invalid credentials.', ['code' => 'invalid_credentials'], 401);
        }

        if (! $user->email_verified_at) {
            return $this->fail(
                'Please verify your email before logging in.',
                ['code' => 'email_not_verified'],
                403
            );
        }

        if ($user->status === 'pending') {
            return $this->fail(
                'Your account is awaiting admin approval.',
                ['code' => 'account_pending'],
                403
            );
        }

        if ($user->status === 'rejected') {
            return $this->fail(
                'Your registration was rejected.',
                ['code' => 'account_rejected', 'reason' => $user->rejection_reason],
                403
            );
        }

        $token = $user->createToken('sgipc')->plainTextToken;

        return $this->ok(
            [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'student_id' => $user->student_id,
                    'profile_photo_url' => $user->profile_photo_url,
                ],
            ],
            'Logged in.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->ok(null, 'Logged out.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->ok([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'student_id' => $user->student_id,
            'batch' => $user->batch,
            'department' => $user->department,
            'profile_photo_url' => $user->profile_photo_url,
            'status' => $user->status,
        ]);
    }
}
