<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DisplaySetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DisplaySettingController extends Controller
{
    /**
     * Public: return current background image URL.
     */
    public function show(): JsonResponse
    {
        $setting = DisplaySetting::getInstance();

        $url = null;
        if ($setting->background_image && Storage::disk('public')->exists($setting->background_image)) {
            $url = Storage::disk('public')->url($setting->background_image);
        }

        return response()->json([
            'success' => true,
            'data'    => ['url' => $url],
        ]);
    }

    /**
     * Public: get display settings (mode, video URL, sound).
     */
    public function getSettings(): JsonResponse
    {
        $setting = DisplaySetting::getInstance();

        return response()->json([
            'success' => true,
            'data' => [
                'display_mode' => $setting->display_mode,
                'external_video_url' => $setting->external_video_url,
                'video_sound' => $setting->video_sound,
            ],
        ]);
    }

    /**
     * Admin: update display settings (mode, video URL, sound).
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'display_mode' => 'required|in:queue,video',
            'external_video_url' => 'nullable|string|max:500',
            'video_sound' => 'required|boolean',
        ], [
            'display_mode.required' => 'Display mode wajib dipilih',
            'display_mode.in' => 'Display mode harus queue atau video',
            'external_video_url.max' => 'URL video maksimal 500 karakter',
            'video_sound.required' => 'Video sound setting wajib dipilih',
            'video_sound.boolean' => 'Video sound harus true atau false',
        ]);

        $setting = DisplaySetting::getInstance();
        $setting->display_mode = $request->display_mode;
        $setting->external_video_url = $request->external_video_url;
        $setting->video_sound = $request->video_sound;
        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Display settings berhasil diperbarui',
            'data' => [
                'display_mode' => $setting->display_mode,
                'external_video_url' => $setting->external_video_url,
                'video_sound' => $setting->video_sound,
            ],
        ]);
    }

    /**
     * Admin: upload (replace) background image.
     * Accepts jpg/jpeg/png/webp, max 3 MB.
     * Auto-resizes to max 1920px on either dimension using GD.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png,webp|max:3072',
        ], [
            'image.required'  => 'File gambar wajib dipilih',
            'image.mimes'     => 'Format yang didukung: JPG, PNG, WEBP',
            'image.max'       => 'Ukuran file maksimal 3 MB',
        ]);

        $file   = $request->file('image');
        $setting = DisplaySetting::getInstance();

        // Remove old file if any
        if ($setting->background_image) {
            Storage::disk('public')->delete($setting->background_image);
        }

        // Process + store
        $storedPath = $this->processAndStore($file);

        $setting->background_image = $storedPath;
        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Background berhasil diperbarui',
            'data'    => ['url' => Storage::disk('public')->url($storedPath)],
        ]);
    }

    /**
     * Admin: delete background image.
     */
    public function destroy(): JsonResponse
    {
        $setting = DisplaySetting::getInstance();

        if ($setting->background_image) {
            Storage::disk('public')->delete($setting->background_image);
            $setting->background_image = null;
            $setting->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Background berhasil dihapus',
        ]);
    }

    // -------------------------------------------------------------------------

    /**
     * Resize image to max 1920px and store to public disk.
     * Falls back to plain storage if GD is unavailable.
     */
    private function processAndStore(\Illuminate\Http\UploadedFile $file): string
    {
        $ext      = strtolower($file->getClientOriginalExtension());
        $filename = 'bg_' . time() . '_' . uniqid() . '.' . $ext;
        $subpath  = 'backgrounds/' . $filename;

        // Ensure directory exists
        Storage::disk('public')->makeDirectory('backgrounds');

        if (!extension_loaded('gd')) {
            // GD unavailable — store as-is
            $file->storeAs('backgrounds', $filename, 'public');
            return $subpath;
        }

        $maxDim  = 1920;
        $quality = 85;

        $img = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($file->getPathname()),
            'png'         => @imagecreatefrompng($file->getPathname()),
            'webp'        => @imagecreatefromwebp($file->getPathname()),
            default       => false,
        };

        if (!$img) {
            $file->storeAs('backgrounds', $filename, 'public');
            return $subpath;
        }

        $w = imagesx($img);
        $h = imagesy($img);

        if ($w > $maxDim || $h > $maxDim) {
            $ratio  = min($maxDim / $w, $maxDim / $h);
            $newW   = (int) round($w * $ratio);
            $newH   = (int) round($h * $ratio);
            $canvas = imagecreatetruecolor($newW, $newH);

            if ($ext === 'png') {
                imagealphablending($canvas, false);
                imagesavealpha($canvas, true);
            }

            imagecopyresampled($canvas, $img, 0, 0, 0, 0, $newW, $newH, $w, $h);
            imagedestroy($img);
            $img = $canvas;
        }

        $fullPath = Storage::disk('public')->path($subpath);

        match ($ext) {
            'jpg', 'jpeg' => imagejpeg($img, $fullPath, $quality),
            'png'         => imagepng($img, $fullPath, 9),
            'webp'        => imagewebp($img, $fullPath, $quality),
            default       => null,
        };

        imagedestroy($img);
        return $subpath;
    }
}
