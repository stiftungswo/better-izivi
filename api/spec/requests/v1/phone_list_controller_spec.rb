require 'rails_helper'

RSpec.describe V1::PhoneListController, type: :request do

  describe "GET #index" do
    it "returns http success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

end
