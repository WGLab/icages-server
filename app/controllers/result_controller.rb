class ResultController < ApplicationController
  def show
    @submission = Submission.find(params[:id])
rescue ActiveRecord::RecordNotFound
	logger.debug "Record not found for submission id:#{params[:id]}" 
  end
end
