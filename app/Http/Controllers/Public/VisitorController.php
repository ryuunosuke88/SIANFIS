<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\QueueService;
use App\Models\Service;
use App\Models\Counter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class VisitorController extends Controller
{
    protected QueueService $queueService;

    public function __construct(QueueService $queueService)
    {
        $this->queueService = $queueService;
    }

    /**
     * Get active services for dropdown.
     */
    public function getServices(): JsonResponse
    {
        $services = Service::active()->get(['id', 'name', 'prefix', 'description']);

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Get active counters for a specific service.
     */
    public function getCountersByService($serviceId): JsonResponse
    {
        // Get counters that are assigned to this service (via pivot table)
        // OR have this service_id (backward compatibility)
        $counters = Counter::where('active', true)
            ->where(function($query) use ($serviceId) {
                $query->where('service_id', $serviceId)
                      ->orWhereHas('services', function($q) use ($serviceId) {
                          $q->where('services.id', $serviceId);
                      });
            })
            ->orderBy('number')
            ->get(['id', 'name', 'number', 'service_id']);

        return response()->json([
            'success' => true,
            'data' => $counters,
        ]);
    }

    /**
     * Register a new visitor.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'agency' => 'required|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'service_id' => 'required|exists:services,id',
            'counter_id' => 'required|exists:counters,id',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'photo' => 'nullable|string',
            'identity_photo' => 'nullable|string',
            'signature' => 'nullable|string',
            'location_lat' => 'nullable|numeric',
            'location_lng' => 'nullable|numeric',
        ]);

        try {
            $queue = $this->queueService->registerVisitor($validated);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil',
                'data' => [
                    'queue_id' => $queue->id,
                    'queue_number' => $queue->formatted_number,
                    'ticket_code' => $queue->ticket_code,
                    'service' => $queue->service->name,
                    'visitor_name' => $queue->visitor->name,
                    'waiting_count' => $this->queueService->getWaitingCount($queue->service_id),
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Visitor registration error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mendaftar',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}