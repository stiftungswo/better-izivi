# frozen_string_literal: true

class UserSetting < ApplicationRecord
  belongs_to :user

  validates :key, presence: true, uniqueness: { scope: :user_id }
end
