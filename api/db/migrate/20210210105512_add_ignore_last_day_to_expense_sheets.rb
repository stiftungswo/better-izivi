class AddIgnoreLastDayToExpenseSheets < ActiveRecord::Migration[6.0]
  def change
    add_column :expense_sheets, :ignore_last_day, :boolean
  end
end
