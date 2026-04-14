<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisplaySetting extends Model
{
    protected $fillable = [
        'background_image',
        'display_mode',
        'external_video_url',
        'video_sound',
    ];

    /**
     * Always work with row ID=1 (single-row settings pattern).
     */
    public static function getInstance(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'background_image' => null,
            'display_mode' => 'queue',
            'external_video_url' => null,
            'video_sound' => false,
        ]);
    }
}
