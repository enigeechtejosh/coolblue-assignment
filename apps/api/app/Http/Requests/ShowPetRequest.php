<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

final class ShowPetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function validationData(): array
    {
        return ['id' => $this->route('id')];
    }

    public function rules(): array
    {
        return [
            'id' => ['bail', 'required', 'string', 'size:36', 'uuid:4'],
        ];
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'error' => [
                'code' => 'INVALID_PET_ID',
                'message' => 'Pet ID must be a valid UUIDv4',
            ],
        ], 400));
    }

    public function petId(): string
    {
        return $this->validated('id');
    }
}
