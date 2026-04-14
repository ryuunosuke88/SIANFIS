<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Counter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Get all services.
     */
    public function index(): JsonResponse
    {
        $services = Service::withCount('queues')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Store a new service.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prefix' => 'required|string|max:5|unique:services,prefix',
            'description' => 'nullable|string',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dibuat',
            'data' => $service,
        ], 201);
    }

    /**
     * Update a service.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'prefix' => 'sometimes|required|string|max:5|unique:services,prefix,' . $id,
            'description' => 'nullable|string',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil diperbarui',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Delete a service.
     */
    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        // Check if service has queues
        if ($service->queues()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak dapat dihapus karena memiliki data antrian',
            ], 400);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dihapus',
        ]);
    }

    /**
     * Get counters for a service.
     */
    public function counters(int $serviceId): JsonResponse
    {
        $counters = Counter::where('service_id', $serviceId)
            ->orderBy('number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counters,
        ]);
    }

    /**
     * Store a new counter.
     */
    public function storeCounter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|integer|min:1',
            'kode_loket' => 'required|string|max:10|unique:counters,kode_loket',
            'service_id' => 'nullable|exists:services,id',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
            'active' => 'boolean',
        ]);

        $counter = Counter::create([
            'name' => $validated['name'],
            'number' => $validated['number'],
            'kode_loket' => $validated['kode_loket'],
            'service_id' => $validated['service_id'] ?? null,
            'active' => $validated['active'] ?? true,
        ]);

        // Sync multiple services if provided
        if (isset($validated['service_ids']) && is_array($validated['service_ids'])) {
            $counter->services()->sync($validated['service_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil dibuat',
            'data' => $counter->load('services'),
        ], 201);
    }

    /**
     * Update a counter.
     */
    public function updateCounter(Request $request, int $id): JsonResponse
    {
        $counter = Counter::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'number' => 'sometimes|required|integer|min:1',
            'kode_loket' => 'sometimes|required|string|max:10|unique:counters,kode_loket,' . $id,
            'service_id' => 'nullable|exists:services,id',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
            'active' => 'boolean',
        ]);

        // Update basic counter fields
        $counter->update([
            'name' => $validated['name'] ?? $counter->name,
            'number' => $validated['number'] ?? $counter->number,
            'kode_loket' => $validated['kode_loket'] ?? $counter->kode_loket,
            'service_id' => $validated['service_id'] ?? $counter->service_id,
            'active' => $validated['active'] ?? $counter->active,
        ]);

        // Sync multiple services if provided
        if (isset($validated['service_ids'])) {
            $counter->services()->sync($validated['service_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil diperbarui',
            'data' => $counter->fresh()->load('services'),
        ]);
    }

    /**
     * Delete a counter.
     */
    public function destroyCounter(int $id): JsonResponse
    {
        $counter = Counter::findOrFail($id);
        $counter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil dihapus',
        ]);
    }

    /**
     * Get all counters.
     */
    public function allCounters(): JsonResponse
    {
        $counters = Counter::with(['service', 'services'])
            ->orderBy('number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counters,
        ]);
    }
}