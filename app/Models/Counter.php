<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Counter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'number',
        'kode_loket',
        'service_id',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the service that owns the counter (legacy single service).
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get all services that this counter can handle (many-to-many).
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'counter_service');
    }

    /**
     * Get active counters.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)->orderBy('number');
    }
}