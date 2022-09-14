class AddPhotographsAcceptedToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :photographs_accepted, :boolean, null: false, default: false
  end
end
