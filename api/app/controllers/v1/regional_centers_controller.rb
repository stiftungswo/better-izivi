# frozen_string_literal: true

module V1
  class RegionalCentersController < APIController
    def index
      @regional_centers = RegionalCenter.select(:name, :address, :short_name, :id)
    end
  end
end
