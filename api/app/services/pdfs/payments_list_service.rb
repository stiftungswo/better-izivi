require 'prawn'

module Pdfs
  class PaymentsListService
    include Prawn::View
    include Pdfs::PrawnHelper

    def initialize()
      update_font_families
      header
    end

    def document
      @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
    end

    private

    def header
      text I18n.t('pdfs.phone_list.header', date: I18n.l(Time.zone.today)), align: :right
    end

  end
end
