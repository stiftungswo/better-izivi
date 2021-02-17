class AddIngoreLastFirstDayToExpenseSheets < ActiveRecord::Migration[6.0]
  def change
    add_column :expense_sheets, :ignore_first_day, :boolean, null: false, default: false
    add_column :expense_sheets, :ignore_last_day, :boolean, null: false, default: false
  end
end
