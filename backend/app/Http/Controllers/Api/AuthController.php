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

    private const CODE_TTL_MINUTES = 15;

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $code = $this->generateCode();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'student_id' => $data['student_id'],
            'batch' => $data['batch'],
            'department' => $data['department'] ?? 'CSE',
            'password' => Hash::make($data['password']),
            'role' => 'client',
            'status' => 'pending',
            'email_verification_code' => $code,
            'email_verification_code_expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        Mail::to($user->email)->queue(new EmailVerificationMail($user, $code));

        return $this->ok(
            ['user_id' => $user->id, 'email' => $user->email],
            'Registration successful. Check your email for the 6-digit verification code.'
        );
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user) {
            return $this->fail('No account found for that email.', ['code' => 'unknown_email'], 404);
        }

        if ($user->email_verified_at) {
            return $this->ok(['already_verified' => true], 'Email already verified.');
        }

        if (! $user->email_verification_code || ! $user->email_verification_code_expires_at) {
            return $this->fail('No active verification code. Request a new one.', ['code' => 'no_code'], 422);
        }

        if (now()->isAfter($user->email_verification_code_expires_at)) {
            return $this->fail('Verification code expired. Request a new one.', ['code' => 'code_expired'], 422);
        }

        if (! hash_equals($user->email_verification_code, $data['code'])) {
            return $this->fail('Invalid verification code.', ['code' => 'invalid_code'], 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_code' => null,
            'email_verification_code_expires_at' => null,
        ])->save();

        return $this->ok(
            ['status' => $user->status],
            'Email verified. Your account is pending admin approval.'
        );
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $data['email'])->first();
        if (! $user) {
            return $this->fail('No account found for that email.', ['code' => 'unknown_email'], 404);
        }

        if ($user->email_verified_at) {
            return $this->ok(['already_verified' => true], 'Email already verified.');
        }

        $code = $this->generateCode();
        $user->forceFill([
            'email_verification_code' => $code,
            'email_verification_code_expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ])->save();

        Mail::to($user->email)->queue(new EmailVerificationMail($user, $code));

        return $this->ok(null, 'A new verification code has been sent.');
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
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
