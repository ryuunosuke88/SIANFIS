<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default admin user if not exists
        $adminExists = DB::table('users')->where('email', 'admin@bppmhkp.co.id')->exists();
        if (!$adminExists) {
            DB::table('users')->insert([
                'name' => 'Admin BPPMHKP',
                'email' => 'admin@bppmhkp.co.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert default services if not exists
        $services = [
            ['id' => 1, 'name' => 'Laboratorium', 'prefix' => 'LAB', 'description' => 'Layanan Laboratorium', 'sort_order' => 1, 'active' => 1],
            ['id' => 2, 'name' => 'Sertifikasi Mutu', 'prefix' => 'SM', 'description' => 'Layanan Sertifikasi Mutu', 'sort_order' => 2, 'active' => 1],
            ['id' => 3, 'name' => 'Konsultasi', 'prefix' => 'KON', 'description' => 'Layanan Konsultasi', 'sort_order' => 3, 'active' => 1],
            ['id' => 4, 'name' => 'Umum', 'prefix' => 'A', 'description' => 'Layanan Umum', 'sort_order' => 4, 'active' => 1],
        ];

        foreach ($services as $service) {
            $exists = DB::table('services')->where('id', $service['id'])->exists();
            if (!$exists) {
                DB::table('services')->insert(array_merge($service, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }

        // Insert default counters if not exists
        $counters = [
            ['id' => 1, 'name' => 'Loket Pendaftaran', 'number' => 1, 'service_id' => null, 'active' => 1],
            ['id' => 2, 'name' => 'Loket Laboratorium', 'number' => 2, 'service_id' => 1, 'active' => 1],
            ['id' => 3, 'name' => 'Loket Sertifikasi', 'number' => 3, 'service_id' => 2, 'active' => 1],
            ['id' => 4, 'name' => 'Loket Konsultasi', 'number' => 4, 'service_id' => 3, 'active' => 1],
        ];

        foreach ($counters as $counter) {
            $exists = DB::table('counters')->where('id', $counter['id'])->exists();
            if (!$exists) {
                DB::table('counters')->insert(array_merge($counter, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove default data
        DB::table('counters')->whereIn('id', [1, 2, 3, 4])->delete();
        DB::table('services')->whereIn('id', [1, 2, 3, 4])->delete();
        DB::table('users')->where('email', 'admin@bppmhkp.co.id')->delete();
    }
};