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
      @sheets = ExpenseSheet.includes(:user).ready_for_payment.to_a
      @payment_timestamp = Time.zone.now
      @sheets.each { |sheet| sheet.update state: :payment_in_progress, payment_timestamp: @payment_timestamp }

      render :show
    end

    def destroy
      @sheets = ExpenseSheet.in_payment(payment_timestamp_param).payment_in_progress.to_a
      @sheets.each { |sheet| sheet.update state: :ready_for_payment, payment_timestamp: '' }

      render :show
    end

    def confirm
      @sheets = ExpenseSheet.in_payment(payment_timestamp_param).payment_in_progress.to_a
      @sheets.each { |sheet| sheet.update state: :paid }

      render :show
    end

    private

    def payment_timestamp_param
      Time.at(params[:payment_timestamp].to_i)
    end

    def set_expense_sheets
      @sheets = ExpenseSheet.in_payment(payment_timestamp_param)
    end

    def generate_pain
      PainGenerationService.new(@sheets).generate_pain.to_xml('pain.001.001.03.ch.02')
    end
  end
end
