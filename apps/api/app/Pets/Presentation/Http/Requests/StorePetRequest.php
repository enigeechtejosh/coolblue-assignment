<?php

declare(strict_types=1);

namespace App\Pets\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

final class StorePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['bail', 'required', 'string', 'max:100'],
            'species' => ['bail', 'required', 'string', 'max:50'],
            'available' => ['required', 'boolean'],
            'birthYear' => ['bail', 'required', 'integer', 'min:1900', 'max:'.date('Y')],
            'image' => ['bail', 'required', 'file', 'image', 'mimes:jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'dimensions:min_width=1,min_height=1', 'max:8192'],
        ];
    }

    public function uploadedImage(): UploadedFile
    {
        $image = $this->file('image');

        if (! $image instanceof UploadedFile) {
            throw new \LogicException('Validated pet image is missing');
        }

        return $image;
    }
}
