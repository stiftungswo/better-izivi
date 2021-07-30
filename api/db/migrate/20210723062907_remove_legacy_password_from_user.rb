class RemoveLegacyPasswordFromUser < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :legacy_password, :string
  end
end
