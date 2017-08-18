<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableMissions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->softDeletes();
            $table->integer('user')->unsigned();
            $table->foreign('user')->references('id')->on('users');
            $table->double('specification');
            $table->foreign('specification')->references('id')->on('specifications');
            $table->date('start');
            $table->date('end');
            $table->date('draft')->nullable(); // "Aufgebot"
            $table->integer('eligible_holiday');
            $table->integer('first_time');
            $table->boolean('long_mission');
            $table->integer('probation_period');
            $table->integer('mission_type');
            $table->date('probation_day')->nullable();
            $table->string('probation_day_comment')->nullable();
            $table->boolean('feedback_mail_sent');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('missions');
    }
}
