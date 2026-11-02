<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table): void {
            $table->id('sequence');
            $table->uuid('id')->unique();
            $table->string('name');
            $table->string('species');
            $table->boolean('available');
            $table->unsignedSmallInteger('birth_year');
            $table->string('date_added', 10);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
