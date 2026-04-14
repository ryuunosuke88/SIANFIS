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
        Schema::table('display_settings', function (Blueprint $table) {
            $table->enum('display_mode', ['queue', 'video'])->default('queue')->after('background_image');
            $table->text('external_video_url')->nullable()->after('display_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('display_settings', function (Blueprint $table) {
            $table->dropColumn(['display_mode', 'external_video_url']);
        });
    }
};
