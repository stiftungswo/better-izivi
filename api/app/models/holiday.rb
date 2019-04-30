# frozen_string_literal: true

class Holiday < ApplicationRecord
  validates :beginning, :ending, :description, :holiday_type, presence: true
  validate :ending_is_after_beginning

  enum holiday_type: {
    company_holiday: 1,
    public_holiday: 2
  }

  private

  def ending_is_after_beginning
    return if ending.nil? || beginning.nil?

    errors.add(:ending, :before_beginning) unless ending >= beginning
  end
end
