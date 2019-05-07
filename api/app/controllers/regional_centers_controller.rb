# frozen_string_literal: true

class RegionalCentersController < ApplicationController
  def index
    @regional_centers = RegionalCenter.select(:name, :address, :short_name, :id)
  end
end
