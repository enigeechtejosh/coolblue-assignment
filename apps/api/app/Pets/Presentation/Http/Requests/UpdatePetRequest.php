<?php

declare(strict_types=1);

namespace App\Pets\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

final class UpdatePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function validationData(): array
    {
        return array_merge(parent::validationData(), ['id' => $this->route('id')]);
    }

    public function rules(): array
    {
        return [
            'id' => ['bail', 'required', 'string', 'size:36', 'uuid:4'],
            'name' => ['bail', 'required', 'string', 'max:100'],
            'species' => ['bail', 'required', 'string', 'max:50'],
            'available' => ['required', 'boolean'],
            'birthYear' => ['bail', 'required', 'integer', 'min:1900', 'max:'.date('Y')],
            'image' => ['bail', 'nullable', 'file', 'image', 'mimes:jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'dimensions:min_width=1,min_height=1', 'max:8192'],
        ];
    }

    public function petId(): string
    {
        return strtolower($this->validated('id'));
    }

    public function uploadedImage(): ?UploadedFile
    {
        $image = $this->file('image');

        return $image instanceof UploadedFile ? $image : null;
    }
}
