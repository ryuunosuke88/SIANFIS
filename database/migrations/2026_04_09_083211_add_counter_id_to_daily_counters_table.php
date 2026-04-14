<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('daily_counters', function (Blueprint $table) {
            $table->unsignedBigInteger('counter_id')->nullable()->after('service_id');
            $table->foreign('counter_id')->references('id')->on('counters')->onDelete('cascade');

            // Make service_id nullable for counter-based tracking
            $table->unsignedBigInteger('service_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_counters', function (Blueprint $table) {
            $table->dropForeign(['counter_id']);
            $table->dropColumn('counter_id');
        });
    }
};
