<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'service_id',
        'counter_id',
        'last_number',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the service that owns the daily counter.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the counter that owns the daily counter.
     */
    public function counter()
    {
        return $this->belongsTo(Counter::class);
    }

    /**
     * Get or create counter for today by service (legacy).
     */
    public static function getTodayCounter($serviceId)
    {
        return static::firstOrCreate(
            [
                'date' => today(),
                'service_id' => $serviceId,
                'counter_id' => null,
            ],
            [
                'last_number' => 0,
            ]
        );
    }

    /**
     * Get or create counter for today by counter ID.
     */
    public static function getTodayCounterByCounter($counterId)
    {
        return static::firstOrCreate(
            [
                'date' => today(),
                'counter_id' => $counterId,
            ],
            [
                'last_number' => 0,
            ]
        );
    }

    /**
     * Increment and get next number.
     */
    public function incrementNumber()
    {
        $this->increment('last_number');
        return $this->last_number;
    }
}