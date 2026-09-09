# frozen_string_literal: true

class FinalizeServiceSpecificationSite < ActiveRecord::Migration[8.0]
  def change
    change_column_null :service_specifications, :site_id, false
    remove_column :service_specifications, :location, :string, null: false
  end
end
