<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\CommentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = CommentReport::with([
            'reporter:id,name',
            'comment.user:id,name',
            'comment.blog:id,title,slug',
        ])->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->ok($query->paginate(30)->withQueryString());
    }

    public function resolve(CommentReport $report): JsonResponse
    {
        $report->update(['status' => 'resolved']);

        return $this->ok($report->fresh(), 'Report resolved.');
    }

    public function destroy(CommentReport $report): JsonResponse
    {
        $report->delete();

        return $this->ok(null, 'Report dismissed.');
    }
}
