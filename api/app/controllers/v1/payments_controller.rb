# frozen_string_literal: true

module V1
  class PaymentsController < ApplicationController
    include V1::Concerns::AdminAuthorizable
    include V1::Concerns::ParamsAuthenticatable

    before_action :authenticate_from_params!, if: -> { request.format.xml? }
    before_action :authenticate_user!, unless: -> { request.format.xml? }
    before_action :authorize_admin!
    before_action :set_expense_sheets, only: :show

    def show
      respond_to do |format|
        format.json
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
      @payment_timestamp = Time.zone.now
      @state = :payment_in_progress
      query.update_all state: @state, payment_timestamp: @payment_timestamp

      render :show
    end

    def destroy
      query = ExpenseSheet.in_payment(payment_timestamp_param).payment_in_progress
      @sheets = query.to_a

      raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.unconfirmed_not_found') if @sheets.empty?

      @payment_timestamp = ''
      @state = :ready_for_payment
      query.update_all state: @state, payment_timestamp: @payment_timestamp

      render :show
    end

    def confirm
      query = ExpenseSheet.in_payment(payment_timestamp_param).payment_in_progress
      @sheets = query.to_a

      raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.unconfirmed_not_found') if @sheets.empty?

      @payment_timestamp = payment_timestamp_param
      @state = :paid
      query.update_all state: @state

      render :show
    end

    private

    def payment_timestamp_param
      Time.at(params[:payment_timestamp].to_i)
    end

    def set_expense_sheets
      @sheets = ExpenseSheet.in_payment(payment_timestamp_param)

      raise ActiveRecord::RecordNotFound, I18n.t('payment.errors.not_found') if @sheets.empty?

      @payment_timestamp = payment_timestamp_param
      @state = @sheets.empty? ? nil : @sheets.first.state
    end

    def generate_pain
      PainGenerationService.new(@sheets).generate_pain.to_xml('pain.001.001.03.ch.02')
    end
  end
end
