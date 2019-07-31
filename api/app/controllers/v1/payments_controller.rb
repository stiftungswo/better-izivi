# frozen_string_literal: true

module V1
  class PaymentsController < ApplicationController
    include V1::Concerns::AdminAuthorizable
    include V1::Concerns::ParamsAuthenticatable

    before_action :authenticate_from_params!, if: -> { request.format.xml? }
    before_action :authenticate_user!, unless: -> { request.format.xml? }
    before_action :authorize_admin!
    before_action :set_unconfirmed_expense_sheets, only: %i[destroy confirm]

    def show
      @sheets = ExpenseSheet.in_payment(payment_timestamp_param)

      raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.not_found') if @sheets.empty?

      payment_timestamp = payment_timestamp_param
      state = @sheets.first.state

      respond_to do |format|
        format.json do
          render :show, locals: { state: state, payment_timestamp: payment_timestamp }
        end
        format.xml do
          render plain: generate_pain, content_type: :xml
        end
      end
    end

    def index
      @payments = ExpenseSheet.payment_issued.group_by(&:payment_timestamp)
    end

    def create
      query = ExpenseSheet.includes(:user).ready_for_payment
      @sheets = query.to_a

      raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.ready_not_found') if query.count.zero?

      payment_timestamp = Time.zone.now
      state = :payment_in_progress

      query.update state: state, payment_timestamp: payment_timestamp

      render :show, locals: { state: state, payment_timestamp: payment_timestamp }
    end

    def destroy
      payment_timestamp = ''
      state = :ready_for_payment

      unconfirmed_expense_sheets_query.update_all state: state, payment_timestamp: payment_timestamp

      render :show, locals: { state: state, payment_timestamp: payment_timestamp }
    end

    def confirm
      payment_timestamp = payment_timestamp_param
      state = :paid

      unconfirmed_expense_sheets_query.update_all state: state

      render :show, locals: { state: state, payment_timestamp: payment_timestamp }
    end

    private

    def payment_timestamp_param
      Time.zone.at(params[:payment_timestamp].to_i)
    end

    def set_unconfirmed_expense_sheets
      @sheets = unconfirmed_expense_sheets_query.to_a

      not_found_exception = ActiveRecord::RecordNotFound.new I18n.t('payment.errors.unconfirmed_not_found')
      raise not_found_exception if unconfirmed_expense_sheets_query.count.zero?
    end

    def unconfirmed_expense_sheets_query
      ExpenseSheet.in_payment(payment_timestamp_param).payment_in_progress
    end

    def generate_pain
      PainGenerationService.new(@sheets).generate_pain.to_xml('pain.001.001.03.ch.02')
    end
  end
end
