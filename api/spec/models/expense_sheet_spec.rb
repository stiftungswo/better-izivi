# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpenseSheet, type: :model do
  it { is_expected.to validate_presence_of :start_date }
  it { is_expected.to validate_presence_of :end_date }
  it { is_expected.to validate_presence_of :user }
  it { is_expected.to validate_presence_of :work_days }
  it { is_expected.to validate_presence_of :bank_account_number }
  it { is_expected.to validate_presence_of :state }
end
