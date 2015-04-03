class ResultController < ApplicationController
  before_filter :add_cross_origin_headers, :only => [:drugs]

  def show
    @submission = Submission.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    @submission = nil
    logger.debug "Record not found for submission id:#{params[:id]}"
  end

  def drugs

  	drugs = []
  	error = nil

  	IO.foreach(CONFIG["drug_data"]) do |line|
  		drugs << /(.+)\s+[^\s]+\s*/.match(line)[1].rstrip
  	end

  	render json: drugs

  end


end
