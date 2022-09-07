class RenameWhitelistedJwtToAllowlistedJwt < ActiveRecord::Migration[6.1]
  def change
    rename_table :whitelisted_jwts, :allowlisted_jwts
  end
end
