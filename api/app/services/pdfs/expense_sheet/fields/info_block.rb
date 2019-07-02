# frozen_string_literal: true

module Pdfs
  module ExpenseSheet
    module Fields
      module InfoBlock
        HEADER_ROWS = {
          service_specification: {
            title: "#{I18n.t('activerecord.models.service_specification').sub(/\w/, &:capitalize)}:"
          },
          user: {
            full_name: I18n.t('activerecord.models.attributes.user.last_name').sub(/\w/, &:capitalize) +
                       ", #{I18n.t('activerecord.models.attributes.user.first_name')}:",
            address: "#{I18n.t('activerecord.models.attributes.user.address')}:",
            zdp: "#{I18n.t('activerecord.models.attributes.user.zdp')}:"
          },
          calculated: [
            {
              label: "#{I18n.t('pdfs.expense_sheet.info_block.complete_service.label')}:",
              value: lambda do |expense_sheet|
                service = expense_sheet.service
                service_days = service.service_days
                I18n.t('pdfs.expense_sheet.info_block.complete_service.value', beginning: I18n.l(service.beginning),
                                                                               ending: I18n.l(service.ending),
                                                                               duration: service_days,
                                                                               count: service_days)
              end
            },
            {
              label: "#{I18n.t('pdfs.expense_sheet.info_block.expense_sheet_time_duration.label')}:",
              value: lambda do |expense_sheet|
                duration = expense_sheet.duration
                I18n.t('pdfs.expense_sheet.info_block.expense_sheet_time_duration.value',
                       beginning: I18n.l(expense_sheet.beginning),
                       ending: I18n.l(expense_sheet.ending),
                       duration: duration,
                       count: duration)
              end
            }
          ]
        }.freeze

        # FOOTER_ROWS = {
        #   user: {
        #     iban: "#{I18n.t('')}"
        #   }
        # }
      end
    end
  end
end
