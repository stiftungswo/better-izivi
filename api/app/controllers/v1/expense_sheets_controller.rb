# frozen_string_literal: true

module V1
  class ExpenseSheetsController < APIController
    before_action :set_expense_sheet, only: %i[show update destroy]

    PERMITTED_EXPENSE_SHEET_KEYS = %i[
      beginning ending work_days
      company_holiday_unpaid_days company_holiday_paid_days company_holiday_comment workfree_days
      ill_days ill_comment personal_vacation_days
      paid_vacation_days paid_vacation_comment unpaid_vacation_days
      unpaid_vacation_comment driving_charges driving_charges_comment
      extraordinarily_expenses extraordinarily_expenses_comment clothes_expenses
      clothes_expenses_comment bank_account_number state
      user_id
    ].freeze

    def index
      @expense_sheets = ExpenseSheet.all
    end

    def show; end

    def create
      @expense_sheet = ExpenseSheet.new(expense_sheet_params)

      raise ValidationError, @expense_sheet.errors unless @expense_sheet.save

      render_show
    end

    def update
      raise ValidationError, @expense_sheet.errors unless @expense_sheet.update(expense_sheet_params)

      render_show
    end

    def destroy
      raise ValidationError, @expense_sheet.errors unless @expense_sheet.destroy

      render_show
    end

    private

    def set_expense_sheet
      @expense_sheet = ExpenseSheet.find(params[:id])
    end

    def render_show
      render :show
    end

    def expense_sheet_params
      params.require(:expense_sheet).permit(*PERMITTED_EXPENSE_SHEET_KEYS)
    end
  end
end
