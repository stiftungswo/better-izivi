# frozen_string_literal: true

module V1
  class FormbricksSurveysController < ApiController
    include V1::Concerns::AdminAuthorizable

    before_action :authorize_admin!

    def index
      @surveys = FormbricksClient.new.link_surveys
    end
  end
end
