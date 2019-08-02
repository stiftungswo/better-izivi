# frozen_string_literal: true

class Payment
  include ActiveModel::Model

  attr_accessor :expense_sheets, :payment_timestamp, :state

  validate :validate_expense_sheets

  def initialize(expense_sheets)
    @expense_sheets = expense_sheets
    @payment_timestamp = Time.zone.now
    @state = :payment_in_progress
  end

  def save
    return false unless valid?

    @expense_sheets.each(&:save)
  end

  def self.find(payment_timestamp)
    payment = allocate

    payment.payment_timestamp = payment_timestamp
    payment.expense_sheets = ExpenseSheet.in_payment(payment.payment_timestamp)

    raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.not_found') if payment.expense_sheets.empty?

    payment.state = payment.expense_sheets.first.state
    payment
  end

  def confirm
    @state = :paid
    update_expense_sheets
  end

  def cancel
    @payment_timestamp = nil
    @state = :ready_for_payment
    update_expense_sheets
  end

  private

  def update_expense_sheets
    @expense_sheets.each { |expense_sheet| expense_sheet.state = @state }
    @expense_sheets.each { |expense_sheet| expense_sheet.payment_timestamp = @payment_timestamp }
  end

  def validate_expense_sheets
    return if @expense_sheets.all?(&:valid?)

    expense_sheets_errors.each do |error|
      error.each { |key, value| errors.add(key, *value) }
    end
  end

  def expense_sheets_errors
    @expense_sheets.map { |expense_sheet| expense_sheet.errors.messages }.uniq
  end
end
