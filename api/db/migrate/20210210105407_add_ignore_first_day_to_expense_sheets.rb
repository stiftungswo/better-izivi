class AddIgnoreFirstDayToExpenseSheets < ActiveRecord::Migration[6.0]
  def change
    add_column :expense_sheets, :ignore_first_day, :boolean
  end
end
