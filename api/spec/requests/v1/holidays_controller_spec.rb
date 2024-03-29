# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::HolidaysController, type: :request do
  context 'when the user is signed in' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      subject(:json_response) { parse_response_json(response) }

      let(:request) { get v1_holidays_path }
      let(:newer_beginning) { Date.parse(attributes_for(:holiday)[:beginning]) + 1.week }
      let(:newer_holiday) { create(:holiday, beginning: newer_beginning, ending: newer_beginning + 2.days) }
      let(:json_holidays) do
        holidays.map do |holiday|
          extract_to_json(holiday).except(:created_at, :updated_at)
        end
      end

      let!(:holidays) do
        create_list(:holiday, 2).push(newer_holiday)
      end

      it 'returns all holidays', :aggregate_failures do
        request
        expect(json_response.length).to eq 3
        expect(json_response).to include(*json_holidays)
      end

      it 'orders response reversed chronologically', :aggregate_failures do
        request
        expect(json_response.first[:beginning]).to eq newer_beginning.to_s
        expect(json_response.second[:beginning]).to eq holidays.second.beginning.to_s
        expect(json_response.last[:beginning]).to eq holidays.first.beginning.to_s
      end

      it_behaves_like 'renders a successful http status code'
    end

    describe '#create' do
      let(:post_request) { post v1_holidays_path(holiday: params) }

      context 'when params are valid' do
        let(:params) { attributes_for(:holiday) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { post_request }
        end

        it 'creates a holiday' do
          expect { post_request }.to change(Holiday, :count).by(1)
        end

        it 'returns the created holiday' do
          post_request
          expect(parse_response_json(response)).to include(
            id: Holiday.last.id,
            beginning: params[:beginning],
            ending: params[:ending],
            holiday_type: params[:holiday_type].to_s,
            description: params[:description]
          )
        end
      end

      context 'when params are invalid' do
        let(:params) { { description: '', ending: 'I am invalid' } }

        it 'does not create a holiday' do
          expect { post_request }.not_to change(Holiday, :count)
        end

        it_behaves_like 'renders a validation error response' do
          let(:request) { post_request }
        end

        it 'renders all validation errors' do
          post_request
          expect(parse_response_json(response)[:errors]).to include(
            ending: be_an_instance_of(Array),
            beginning: be_an_instance_of(Array),
            description: be_an_instance_of(Array)
          )
        end
      end
    end

    describe '#update' do
      let!(:holiday) { create :holiday }
      let(:put_request) { put v1_holiday_path(holiday, params: { holiday: params }) }

      context 'with valid params' do
        let(:params) { { description: 'New description' } }
        let(:expected_attributes) { extract_to_json(holiday, :beginning, :ending, :description, :holiday_type, :id) }

        it 'updates the holiday description' do
          expect { put_request }.to(change { holiday.reload.description }.to('New description'))
        end

        it_behaves_like 'renders a successful http status code' do
          let(:request) { put_request }
        end

        it 'returns the updated holiday' do
          put_request
          expect(parse_response_json(response)).to include(expected_attributes)
        end
      end

      context 'with invalid params' do
        let(:params) { { description: '' } }

        it_behaves_like 'renders a validation error response' do
          let(:request) { put_request }
        end

        it 'renders all validation errors' do
          put_request
          expect(parse_response_json(response)[:errors]).to include(
            description: be_an_instance_of(Array)
          )
        end
      end

      context 'when the requested resource does not exist' do
        it_behaves_like 'renders a not found error response' do
          let(:request) { put v1_holiday_path(-2) }
        end
      end
    end

    describe '#destroy' do
      let!(:holiday) { create :holiday }
      let(:delete_request) { delete v1_holiday_path(holiday) }

      it 'deletes the holiday' do
        expect { delete_request }.to change(Holiday, :count).by(-1)
      end

      it_behaves_like 'renders a successful http status code' do
        let(:request) { delete_request }
      end

      context 'when the requested resource does not exist' do
        let(:request) { delete v1_holiday_path(-2) }

        it_behaves_like 'renders a not found error response'

        it 'does not delete anything' do
          expect { request }.not_to change(Holiday, :count)
        end
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'login protected resource' do
        let(:request) { get v1_holidays_path }
      end
    end

    describe '#create' do
      let(:params) { attributes_for(:holiday) }
      let(:request) { post v1_holidays_path(holiday: params) }

      it_behaves_like 'login protected resource'

      it 'does not create a new holiday' do
        expect { request }.not_to change(Holiday, :count)
      end
    end

    describe '#update' do
      let!(:holiday) { create :holiday }
      let(:request) { put v1_holiday_path(holiday, params: { holiday: params }) }
      let(:params) { { description: 'New description' } }

      it_behaves_like 'login protected resource'

      it 'does not update the holiday' do
        expect { request }.not_to(change { holiday.reload.description })
      end
    end

    describe '#destroy' do
      let!(:holiday) { create :holiday }
      let(:request) { delete v1_holiday_path(holiday) }

      it_behaves_like 'login protected resource'

      it 'does not delete the holiday' do
        expect { request }.not_to change(Holiday, :count)
      end
    end
  end
end
