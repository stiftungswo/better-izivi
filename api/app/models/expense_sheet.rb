# frozen_string_literal: true

class ExpenseSheet < ApplicationRecord
  belongs_to :user

  validates :start_date, :end_date, :user,
            :work_days, :bank_account_number, :state, presence: true

  enum state: {
    open: 0,
    ready_for_payment: 1,
    payment_in_progress: 2,
    paid: 3
  }
end
