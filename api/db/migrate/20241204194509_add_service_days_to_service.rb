class AddServiceDaysToService < ActiveRecord::Migration[6.1]
  def change
    add_column :services, :service_days, :integer, null: true

    reversible do |dir|
      dir.up do
        Service.all.each do |service|
          service.assign_attributes service_days: service.calculate_service_days
          service.save!(validate: false)
        end

        change_column :services, :service_days, :integer, null: false
      end
    end
  end
end
