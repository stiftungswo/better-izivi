# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ExpenseSheetsController, type: :request do
  context 'when the user is signed in' do
    let(:user) { create :user, :admin }

    before { sign_in user }

    describe '#index' do
      it_behaves_like 'renders a successful http status code' do
        before { create :expense_sheet }

        let(:request) { get v1_expense_sheets_path }
      end
    end

    describe '#create' do
      subject { -> { post_request } }

      let(:post_request) { post v1_expense_sheets_path(expense_sheet: params) }

      context 'when params are valid' do
        let(:params) do
          attributes_for(:expense_sheet).merge user_id: user.id, beginning: '2019-04-29', ending: '2019-05-05', state: 'open'
        end

        it_behaves_like 'renders a successful http status code' do
          let(:request) { post_request }
        end

        it { is_expected.to change(ExpenseSheet, :count).by(1) }

        it 'returns the created expense_sheet' do
          post_request
          expect(parse_response_json(response)).to include(
                                                     id: ExpenseSheet.last.id,
                                                     beginning: params[:beginning],
                                                     ending: params[:ending],
                                                     state: params[:state],
                                                     workfree_days: params[:workfree_days],
                                                     user_id: params[:user_id]
                                                   )
        end
      end

      context 'when params are invalid' do
        let(:params) { { driving_expenses: 'aa', ending: 'I am invalid' } }

        it { is_expected.to change(ExpenseSheet, :count).by(0) }

        describe 'returned error' do
          it_behaves_like 'renders a validation error response' do
            let(:request) { post_request }
          end

          it 'renders all validation errors' do
            post_request
            expect(parse_response_json(response)[:errors]).to include(
                                                                ending: be_an_instance_of(Array),
                                                                beginning: be_an_instance_of(Array),
                                                                driving_expenses: be_an_instance_of(Array)
                                                              )
          end
        end
      end
    end

    describe '#update' do
      let!(:expense_sheet) { create :expense_sheet }
      let(:put_request) { put v1_expense_sheet_path(expense_sheet, params: { expense_sheet: params }) }

      context 'with valid params' do
        subject { -> { put_request } }

        let(:params) { { driving_expenses: 6969 } }
        let(:expected_attributes) { extract_to_json(expense_sheet, :beginning, :ending, :driving_expenses, :expense_sheet_type, :id) }

        it { is_expected.to(change { expense_sheet.reload.driving_expenses }.to(6969)) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { put_request }
        end

        it 'returns the updated expense_sheet' do
          put_request
          expect(parse_response_json(response)).to include(expected_attributes)
        end
      end

      context 'with invalid params' do
        let(:params) { { driving_expenses: 'a' } }

        it_behaves_like 'renders a validation error response' do
          let(:request) { put_request }
        end

        it 'renders all validation errors' do
          put_request
          expect(parse_response_json(response)[:errors]).to include(
                                                              driving_expenses: be_an_instance_of(Array)
                                                            )
        end
      end

      context 'when the requested resource does not exist' do
        it_behaves_like 'renders a not found error response' do
          let(:request) { put v1_expense_sheet_path(-2) }
        end
      end
    end

    describe '#destroy' do
      subject { -> { delete_request } }

      let!(:expense_sheet) { create :expense_sheet }
      let(:delete_request) { delete v1_expense_sheet_path(expense_sheet) }

      it { is_expected.to change(ExpenseSheet, :count).by(-1) }

      it 'returns the deleted resource' do
        expected_response = extract_to_json(expense_sheet, :id, :beginning, :ending, :description)

        delete_request

        expect(parse_response_json(response)).to include(expected_response)
      end

      context 'when the requested resource does not exist' do
        let(:request) { delete v1_expense_sheet_path(-2) }

        it_behaves_like 'renders a not found error response'

        it 'does not delete anything' do
          expect { request }.not_to change(ExpenseSheet, :count)
        end
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'login protected resource' do
        let(:request) { get v1_expense_sheets_path }
      end
    end

    describe '#create' do
      let(:params) { attributes_for(:expense_sheet) }
      let(:request) { post v1_expense_sheets_path(expense_sheet: params) }

      it_behaves_like 'login protected resource'

      it 'does not create a new expense_sheet' do
        expect { request }.not_to change(ExpenseSheet, :count)
      end
    end

    describe '#update' do
      let!(:expense_sheet) { create :expense_sheet }
      let(:request) { put v1_expense_sheet_path(expense_sheet, params: { expense_sheet: params }) }
      let(:params) { { driving_expenses: 1000 } }

      it_behaves_like 'login protected resource'

      it 'does not update the expense_sheet' do
        expect { request }.not_to(change { expense_sheet.reload.driving_expenses })
      end
    end

    describe '#destroy' do
      let!(:expense_sheet) { create :expense_sheet }
      let(:request) { delete v1_expense_sheet_path(expense_sheet) }

      it_behaves_like 'login protected resource'

      it 'does not delete the expense_sheet' do
        expect { request }.not_to change(ExpenseSheet, :count)
      end
    end
  end
end
