<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectMemberRequest;
use App\Http\Traits\ApiResponse;
use App\Mail\RegistrationApprovedMail;
use App\Mail\RegistrationRejectedMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MemberController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'client')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $members = $query->paginate(20)->withQueryString();

        return $this->ok($members);
    }

    public function approve(User $member): JsonResponse
    {
        if ($member->role === 'admin') {
            return $this->fail('Cannot modify another admin.', ['code' => 'forbidden'], 403);
        }

        $member->forceFill([
            'status' => 'approved',
            'rejection_reason' => null,
        ])->save();

        Mail::to($member->email)->queue(new RegistrationApprovedMail($member));

        return $this->ok(['id' => $member->id, 'status' => $member->status], 'Member approved.');
    }

    public function reject(RejectMemberRequest $request, User $member): JsonResponse
    {
        if ($member->role === 'admin') {
            return $this->fail('Cannot modify another admin.', ['code' => 'forbidden'], 403);
        }

        $reason = (string) $request->validated('reason');

        $member->forceFill([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ])->save();

        Mail::to($member->email)->queue(new RegistrationRejectedMail($member, $reason));

        return $this->ok(['id' => $member->id, 'status' => $member->status], 'Member rejected.');
    }

    public function destroy(User $member): JsonResponse
    {
        if ($member->role === 'admin') {
            return $this->fail('Cannot delete another admin.', ['code' => 'forbidden'], 403);
        }

        $member->delete();

        return $this->ok(null, 'Member removed.');
    }
}
