<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing service_id relationships to pivot table
        $counters = DB::table('counters')
            ->whereNotNull('service_id')
            ->get(['id', 'service_id']);

        foreach ($counters as $counter) {
            DB::table('counter_service')->insert([
                'counter_id' => $counter->id,
                'service_id' => $counter->service_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear pivot table data (optional - could restore to service_id column)
        DB::table('counter_service')->truncate();
    }
};
