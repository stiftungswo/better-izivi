# frozen_string_literal: true

class AddFormbricksSurveyIdToServiceSpecifications < ActiveRecord::Migration[8.0]
  def change
    add_column :service_specifications, :formbricks_survey_id, :string
  end
end
