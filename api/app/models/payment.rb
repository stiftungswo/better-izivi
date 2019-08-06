# frozen_string_literal: true

class Payment
  include ActiveModel::Model

  attr_accessor :expense_sheets, :payment_timestamp, :state

  validate :validate_expense_sheets

  def self.find(payment_timestamp)
    payment = allocate

    payment.payment_timestamp = payment_timestamp
    payment.expense_sheets = ExpenseSheet.in_payment(payment.payment_timestamp)

    raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.not_found') if payment.expense_sheets.empty?

    payment.state = payment.expense_sheets.first.state
    payment
  end

  def self.all
    ExpenseSheet.payment_issued.group_by(&:payment_timestamp).map do |payment_timestamp, expense_sheets|
      state = expense_sheets.first.state
      Payment.new(expense_sheets: expense_sheets, state: state, payment_timestamp: payment_timestamp)
    end
  end

  def initialize(expense_sheets:, payment_timestamp: Time.zone.now, state: :payment_in_progress)
    @expense_sheets = expense_sheets
    @payment_timestamp = payment_timestamp
    @state = state
  end

  def save(validate: true)
    update_expense_sheets

    return false unless valid? || !validate

    @expense_sheets.each do |expense_sheet|
      expense_sheet.save(validate: validate)
    end

    true
  end

  def confirm
    @state = :paid
    save
  end

  def cancel
    @payment_timestamp = nil
    @state = :ready_for_payment
    save
  end

  def total
    @expense_sheets.sum(&:calculate_full_expenses)
  end

  private

  def update_expense_sheets
    @expense_sheets.each do |expense_sheet|
      expense_sheet.state = @state
      expense_sheet.payment_timestamp = @payment_timestamp
    end
  end

  def validate_expense_sheets
    return if @expense_sheets.all?(&:valid?)

    expense_sheets_errors.each(&method(:add_error))
  end

  def expense_sheets_errors
    @expense_sheets.map { |expense_sheet| expense_sheet.errors.messages }.uniq
  end

  def add_error(error)
    error.each { |key, value| errors.add(key, *value) }
  end
end
