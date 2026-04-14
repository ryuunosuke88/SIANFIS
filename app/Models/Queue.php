<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'service_id',
        'counter_id',
        'queue_number',
        'queue_date',
        'status',
        'counter_number',
        'called_at',
        'finished_at',
        'ticket_code',
    ];

    protected $casts = [
        'queue_date' => 'date',
        'called_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    /**
     * Get the visitor that owns the queue.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Get the service that owns the queue.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the counter assigned to this queue (via counter_id).
     */
    public function counter()
    {
        return $this->belongsTo(Counter::class, 'counter_id');
    }

    /**
     * Get the counter that called this queue (via counter_number - legacy).
     */
    public function calledCounter()
    {
        return $this->belongsTo(Counter::class, 'counter_number', 'number');
    }

    /**
     * Get queues for today.
     */
    public function scopeToday($query)
    {
        return $query->where('queue_date', today());
    }

    /**
     * Get waiting queues.
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    /**
     * Get called queues.
     */
    public function scopeCalled($query)
    {
        return $query->where('status', 'called');
    }

    /**
     * Get done queues.
     */
    public function scopeDone($query)
    {
        return $query->where('status', 'done');
    }

    /**
     * Get formatted queue number with prefix.
     * Uses counter kode_loket if available, otherwise service prefix.
     */
    public function getFormattedNumberAttribute()
    {
        // Try to get counter's kode_loket first (new system)
        if ($this->counter_id && $this->counter && $this->counter->kode_loket) {
            $prefix = $this->counter->kode_loket;
        } else {
            // Fallback to service prefix (legacy)
            $prefix = $this->service->prefix ?? 'A';
        }

        return $prefix . '-' . str_pad($this->queue_number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Check if queue is waiting.
     */
    public function isWaiting()
    {
        return $this->status === 'waiting';
    }

    /**
     * Check if queue is called.
     */
    public function isCalled()
    {
        return $this->status === 'called';
    }

    /**
     * Check if queue is done.
     */
    public function isDone()
    {
        return $this->status === 'done';
    }
}