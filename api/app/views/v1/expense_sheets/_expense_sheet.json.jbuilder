# frozen_string_literal: true

json.extract! expense_sheet, :id, :beginning, :ending, :work_days,
              :company_holiday_unpaid_days, :company_holiday_paid_days, :company_holiday_comment, :workfree_days,
              :ill_days, :ill_comment, :personal_vacation_days,
              :paid_vacation_days, :paid_vacation_comment, :unpaid_vacation_days,
              :unpaid_vacation_comment, :driving_charges, :driving_charges_comment,
              :extraordinarily_expenses, :extraordinarily_expenses_comment, :clothes_expenses,
              :clothes_expenses_comment, :bank_account_number, :state,
              :user_id
