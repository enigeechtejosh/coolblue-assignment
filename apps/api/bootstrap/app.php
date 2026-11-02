<?php

use App\Application\Pets\PetNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(
        function (Middleware $middleware): void {},
    )
    ->withExceptions(
        function (Exceptions $exceptions): void {
            $exceptions->shouldRenderJsonWhen(fn () => true);
            $exceptions->dontReport([PetNotFoundException::class]);
            $exceptions->respond(function (Response $response, Throwable $error): Response {
                // Explicit responses, such as invalid pet IDs, already have their API payload.
                if ($error instanceof HttpResponseException || $response->getStatusCode() < 400) {
                    return $response;
                }

                $status = $error instanceof PetNotFoundException ? 404 : $response->getStatusCode();
                [$code, $message] = match (true) {
                    $error instanceof PetNotFoundException => ['PET_NOT_FOUND', $error->getMessage()],
                    $status === 404 => ['NOT_FOUND', 'Route was not found'],
                    $status >= 500 => ['INTERNAL_SERVER_ERROR', 'An unexpected error occurred'],
                    default => ['HTTP_ERROR', 'Request could not be processed'],
                };

                return response()->json([
                    'error' => ['code' => $code, 'message' => $message],
                ], $status, $response->headers->all());
            });
        },
    )->create();
