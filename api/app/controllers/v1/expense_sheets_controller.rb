# frozen_string_literal: true

module V1
  # :reek:TooManyInstanceVariables
  class ExpenseSheetsController < ApplicationController
    include V1::Concerns::AdminAuthorizable
    include V1::Concerns::ParamsAuthenticatable
    include V1::Concerns::JsonAndPdfRespondable

    before_action :authenticate_user!, unless: -> { request.format.pdf? }
    before_action :authenticate_from_params!, if: -> { request.format.pdf? }
    before_action :set_expense_sheet, only: %i[show update destroy hints]
    before_action :set_service, only: :create
    before_action :authorize_admin!, unless: -> { request.format.pdf? }

    PERMITTED_EXPENSE_SHEET_KEYS = %i[
      beginning ending work_days unpaid_company_holiday_days
      paid_company_holiday_days company_holiday_comment workfree_days
      sick_days sick_comment user_id
      paid_vacation_days paid_vacation_comment unpaid_vacation_days
      unpaid_vacation_comment driving_expenses driving_expenses_comment
      extraordinary_expenses extraordinary_expenses_comment clothing_expenses
      clothing_expenses_comment bank_account_number state ignore_first_day
      ignore_last_day
    ].freeze

    def index
      @expense_sheets = filtered_expense_sheets.order(beginning: :asc, ending: :asc)
                                               .limit(Integer(items_param) + 1)
                                               .offset((Integer(site_param) - 1) * Integer(items_param))
    end

    def show
      respond_to_json_and_pdf(
        Pdfs::ExpenseSheet::GeneratorService,
        I18n.t('pdfs.expense_sheet.filename', today: @expense_sheet.user.full_name),
        @expense_sheet
      )
    end

    def hints
      suggestions = ExpenseSheetCalculators::SuggestionsCalculator.new(@expense_sheet).suggestions
      remaining_days = ExpenseSheetCalculators::RemainingDaysCalculator.new(@expense_sheet.service).remaining_days

      render :hints, locals: { suggestions:, remaining_days: }
    end

    def sum
      @expense_sheets_sum = filtered_expense_sheets
    end

    # :reek:FeatureEnvy
    def check_for_sick_days
      expense_sheet = ExpenseSheet.find(params[:id])
      req = AuthenticateInDime.new
      @sick_days = req.check_for_sick_days(expense_sheet.user.id, expense_sheet.beginning, expense_sheet.ending)
    end

    def create
      @expense_sheet = ExpenseSheetGenerator.new(@service).create_additional_expense_sheet

      render :show
    end

    # TODO: check state updates (does it already belong to a payment?)
    def update
      raise ValidationError, @expense_sheet.errors unless @expense_sheet.update(expense_sheet_params)

      render :show
    end

    def destroy
      raise ValidationError, @expense_sheet.errors unless @expense_sheet.destroy
    end

    private

    def filtered_expense_sheets
      case filter_param
      when 'current'
        ExpenseSheet.open.before_date(Time.zone.today.at_end_of_month + 1.day)
      when 'pending'
        ExpenseSheet.where(state: %i[open ready_for_payment])
      when 'ready_for_payment'
        ExpenseSheet.ready_for_payment
      else
        ExpenseSheet.all
      end
    end

    def set_expense_sheet
      @expense_sheet = ExpenseSheet.find(params[:id])
    end

    def set_service
      @service = Service.find(params[:service_id])
    end

    def expense_sheet_params
      params.require(:expense_sheet).permit(*PERMITTED_EXPENSE_SHEET_KEYS)
    end

    def filter_param
      params[:filter]
    end

    def items_param
      params[:items].nil? ? 10_000_000 : params[:items]
    end

    def site_param
      params[:site].nil? ? 1 : params[:site]
    end
  end
end
