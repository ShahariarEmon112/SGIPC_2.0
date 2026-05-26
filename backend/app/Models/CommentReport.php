<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentReport extends Model
{
    protected $fillable = ['comment_id', 'reported_by', 'reason', 'status'];

    public function comment(): BelongsTo
    {
        return $this->belongsTo(BlogComment::class, 'comment_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
