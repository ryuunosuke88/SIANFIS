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
            $table->boolean('video_sound')->default(false)->after('external_video_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('display_settings', function (Blueprint $table) {
            $table->dropColumn('video_sound');
        });
    }
};
