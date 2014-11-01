class ResultController < ApplicationController
  def show
    @submission = Submission.find(params[:id])
  end
end
