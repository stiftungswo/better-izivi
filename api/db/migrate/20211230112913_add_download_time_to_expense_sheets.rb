class AddDownloadTimeToExpenseSheets < ActiveRecord::Migration[6.1]
  def change
    add_column :expense_sheets, :included_in_download_at, :integer
  end
end
