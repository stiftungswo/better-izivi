<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mission;
use App\ReportSheet;
use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;

class MissionController extends Controller
{
    public function postMission()
    {
        $mission = new Mission();
        $this->fillAttributes($mission);

        $user = Auth::user();
        if ($mission->user == 'me') {
            $mission->user = $user->id;
        }

        if (!$user->isAdmin() && $user->id!=$mission->user) {
            return response("not allowed", 401);
        }

        $mission->save();
        return response("inserted");
    }

    public function putMission($id)
    {
        $mission = Mission::find($id);
        $this->updateReportSheets($mission);
        $this->fillAttributes($mission);

        $user = Auth::user();
        if (!$user->isAdmin() && ($user->id!=$mission->user || $mission->draft!=null)) {
            return response("not allowed", 401);
        }

        $mission->save();
        return response("updated");
    }

    private function updateReportSheets(&$mission)
    {
        if ($mission->draft) {
            if ($mission->end != Input::get("end", "") && $mission->end < Input::get("end", "")) {
                $start = new \DateTime($mission->end);
                $end = new \DateTime(Input::get("end", ""));
                $iteratorStart = $start->modify("next day");
                $iteratorEnd = clone $iteratorStart;
                $iteratorEnd->modify('last day of this month');

                while ($iteratorEnd<$end) {
                    ReportSheet::add($mission, $iteratorStart, $iteratorEnd);
                    $iteratorStart->modify('first day of next month');
                    $iteratorEnd->modify('last day of next month');
                }
                ReportSheet::add($mission, $iteratorStart, $end);
            }
        }
    }
 

  /**
  * @param $mission is passed by reference
  */
    private function fillAttributes(&$mission)
    {
        $mission->user = Input::get("user", "");
        $mission->specification = Input::get("specification", "");
        $mission->mission_type = Input::get("mission_type", false);
        $mission->start = Input::get("start", "");
        $mission->end = Input::get("end", "");
        $mission->first_time = Input::get("first_time", false);
        $mission->long_mission = Input::get("long_mission", false);
        $mission->probation_period = Input::get("probation_period", false);
        $mission->feedback_mail_sent = false;
        $mission->feedback_done = false;

        $start = DateTime::createFromFormat('Y-m-d', $mission->start);
        $end = DateTime::createFromFormat('Y-m-d', $mission->end);
        $dayCount = $start->diff($end)->days + 1;

        $mission->eligible_holiday = MissionController::calculateZiviHolidays($mission->long_mission, $dayCount);
    }

    # TODO implement a test as soon as calculate zivi holidays got replaced (issue #78)
    public static function calculateZiviHolidays($long_mission, $dayCount)
    {

        if ($long_mission === 'true' || $long_mission === true || $long_mission == 1) {
            $long_mission_min_duration = 180;
            $base_holiday_days = 8;
            $holiday_days_per_month = 2;
            $month_day_rule = 30;

            if ($dayCount < $long_mission_min_duration) {
                return 0;
            } else {
              // Holiday calculation: 8 per 180 days + 2 every additional 30 days
                return $base_holiday_days + (floor(($dayCount - $long_mission_min_duration) / $month_day_rule) * $holiday_days_per_month);
            }
        }
        return 0;
    }
}