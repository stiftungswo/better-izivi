class AddStatsOnSaturdayToService < ActiveRecord::Migration[6.0]
  def change
    add_column :services, :starts_on_saturday, :boolean, null: false, default: false
  end
end
