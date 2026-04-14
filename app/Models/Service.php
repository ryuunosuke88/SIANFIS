<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'prefix',
        'description',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the queues for the service.
     */
    public function queues()
    {
        return $this->hasMany(Queue::class);
    }

    /**
     * Get the counters for the service (legacy one-to-many).
     */
    public function counters()
    {
        return $this->hasMany(Counter::class);
    }

    /**
     * Get all counters that can handle this service (many-to-many).
     */
    public function assignedCounters()
    {
        return $this->belongsToMany(Counter::class, 'counter_service');
    }

    /**
     * Get the daily counters for the service.
     */
    public function dailyCounters()
    {
        return $this->hasMany(DailyCounter::class);
    }

    /**
     * Get active services.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)->orderBy('sort_order');
    }
}