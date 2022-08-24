class RenameWhitelistedJwtToAllowlistedJwt < ActiveRecord::Migration[7.0]
  def change
    rename_table :whitelisted_jwts, :allowlisted_jwts
  end
end
