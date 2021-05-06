class AddDimeIdToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :dime_id, :integer, default: 0
  end
end
